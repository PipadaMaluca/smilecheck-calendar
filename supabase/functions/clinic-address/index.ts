import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

// Saves a clinic's address (owner only) and geocodes it server-side with key-free services:
// France → API Adresse (Base Adresse Nationale, score ≥ 0.5) then Photon; elsewhere → Photon (OpenStreetMap,
// filtered by the clinic's country) then API Adresse. Max 1 request/second (global DB throttle), identifying
// User-Agent without email, cache = only re-query when the address changes. Only clinic addresses are sent.
const USER_AGENT = "SmileCheck/1.0 (clinic address geocoding)";
const HEADERS = { "User-Agent": USER_AGENT, "Accept": "application/json" };
const BAN = "https://api-adresse.data.gouv.fr/search/";
const PHOTON = "https://photon.komoot.io/api/";
export const BAN_MIN_SCORE = 0.5;

const Save = z.object({
  clinicId: z.string().uuid(),
  address: z.string().trim().min(1).max(200),
  postalCode: z.string().trim().max(20).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
});
const Backfill = z.object({ mode: z.literal("backfill") });

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Clinic = { id: string; address: string | null; postal_code: string | null; city: string | null; country: string; geocoded_address: string | null };

export const addressKey = (c: { address?: string | null; postal_code?: string | null; city?: string | null; country?: string | null }) =>
  [c.address, c.postal_code, c.city, c.country].map((v) => (v ?? "").trim().replace(/\s+/g, " ").toLowerCase()).join("|");

type Hit = { lat: number; lng: number; source: "ban" | "photon" };
type Lookup = Hit | null | "error";

async function getJson(admin: SupabaseClient, url: string): Promise<unknown | "error"> {
  const { error } = await admin.rpc("claim_geocode_slot");
  if (error) { console.error("geocode slot failed:", error.message); return "error"; }
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) { console.error(`Geocoder [${res.status}] ${new URL(url).host}: ${(await res.text()).slice(0, 200)}`); return "error"; }
    return await res.json();
  } catch (e) { console.error("Geocoder fetch failed:", String(e)); return "error"; }
}

const freeText = (c: Pick<Clinic, "address" | "postal_code" | "city">) =>
  [c.address, [c.postal_code, c.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

async function viaBan(admin: SupabaseClient, c: Clinic): Promise<Lookup> {
  const p = new URLSearchParams({ q: freeText(c), limit: "1" });
  if (c.postal_code) p.set("postcode", c.postal_code.replace(/\s+/g, ""));
  const data = await getJson(admin, `${BAN}?${p}`) as { features?: { geometry: { coordinates: [number, number] }; properties: { score: number } }[] } | "error";
  if (data === "error") return "error";
  const f = data.features?.[0];
  if (!f || !(f.properties?.score >= BAN_MIN_SCORE)) return null;
  const [lng, lat] = f.geometry.coordinates;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, source: "ban" } : null;
}

async function viaPhoton(admin: SupabaseClient, c: Clinic): Promise<Lookup> {
  // A few candidates so the country filter can drop homonyms abroad.
  const p = new URLSearchParams({ q: freeText(c), limit: "5" });
  const data = await getJson(admin, `${PHOTON}?${p}`) as { features?: { geometry: { coordinates: [number, number] }; properties: { countrycode?: string } }[] } | "error";
  if (data === "error") return "error";
  const want = (c.country || "PT").toUpperCase();
  const f = data.features?.find((x) => (x.properties?.countrycode ?? "").toUpperCase() === want);
  if (!f) return null;
  const [lng, lat] = f.geometry.coordinates;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, source: "photon" } : null;
}

async function geocode(admin: SupabaseClient, c: Clinic): Promise<Lookup> {
  const order = (c.country || "PT").toUpperCase() === "FR" ? [viaBan, viaPhoton] : [viaPhoton, viaBan];
  let sawError = false;
  for (const fn of order) {
    const r = await fn(admin, c);
    if (r && r !== "error") return r;
    if (r === "error") sawError = true;
  }
  return sawError ? "error" : null;
}

async function refreshCoordinates(admin: SupabaseClient, c: Clinic): Promise<"ok" | "not_found" | "error" | "cached"> {
  const key = addressKey(c);
  if (c.geocoded_address === key) return "cached";
  const r = await geocode(admin, c);
  const status = r === "error" ? "error" : r ? "ok" : "not_found";
  await admin.from("clinics").update({
    latitude: r && r !== "error" ? r.lat : null,
    longitude: r && r !== "error" ? r.lng : null,
    geocode_source: r && r !== "error" ? r.source : null,
    // On a service error keep no cache key, so the next save retries.
    geocoded_address: status === "error" ? null : key,
    geocode_status: status,
    geocoded_at: new Date().toISOString(),
  }).eq("id", c.id);
  return status;
}

const COLS = "id, address, postal_code, city, country, geocoded_address, owner_profile_id";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));

  // One-off / maintenance: geocode stored clinic addresses that were never geocoded. Uses only stored data.
  if (Backfill.safeParse(body).success) {
    const { data } = await admin.from("clinics").select(COLS).not("address", "is", null).is("geocoded_address", null).limit(10);
    const out: Record<string, string> = {};
    for (const c of (data ?? []) as Clinic[]) out[c.id] = await refreshCoordinates(admin, c);
    return json({ processed: Object.keys(out).length, results: out });
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const parsed = Save.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const p = parsed.data;

  const { data: clinic } = await admin.from("clinics").select(COLS).eq("id", p.clinicId).maybeSingle();
  if (!clinic || clinic.owner_profile_id !== user.id) return json({ error: "forbidden" }, 403);

  const { data: saved, error } = await admin.from("clinics")
    .update({ address: p.address, postal_code: p.postalCode || null, city: p.city || null })
    .eq("id", p.clinicId).select(COLS).single();
  if (error || !saved) return json({ error: "save_failed" }, 500);

  const status = await refreshCoordinates(admin, saved as Clinic);
  const { data: final } = await admin.from("clinics").select("geocode_status, geocode_source").eq("id", p.clinicId).single();
  return json({ saved: true, geocode: final?.geocode_status ?? null, source: final?.geocode_source ?? null });
});
