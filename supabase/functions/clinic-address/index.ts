import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

// Saves a clinic's address (owner only) and geocodes it server-side with Nominatim (OpenStreetMap).
// Usage policy: max 1 request/second (global DB throttle), identifying User-Agent, cache = only
// re-query when the address changes (clinics.geocoded_address). Only clinic (professional) addresses are sent.
const USER_AGENT = "SmileCheck/1.0 (clinic address geocoding)";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

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

async function geocode(admin: SupabaseClient, c: Clinic): Promise<{ lat: number; lng: number } | null | "error"> {
  const { error: slotErr } = await admin.rpc("claim_geocode_slot");
  if (slotErr) return "error";
  const country = (c.country || "PT").toLowerCase();
  const params = new URLSearchParams({ format: "jsonv2", limit: "1", countrycodes: country, street: c.address ?? "" });
  if (c.postal_code) params.set("postalcode", c.postal_code);
  if (c.city) params.set("city", c.city);
  let res = await fetch(`${NOMINATIM}?${params}`, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt,fr,en" } });
  if (!res.ok) { console.error(`Nominatim [${res.status}]`); return "error"; }
  let rows = await res.json() as { lat: string; lon: string }[];
  if (!rows.length) {
    // Free-text fallback (e.g. "Rue de Paris 45, Mitry-Mory" stored in one field).
    await admin.rpc("claim_geocode_slot");
    const q = [c.address, c.postal_code, c.city].filter(Boolean).join(", ");
    res = await fetch(`${NOMINATIM}?${new URLSearchParams({ format: "jsonv2", limit: "1", countrycodes: country, q })}`,
      { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) { console.error(`Nominatim [${res.status}]`); return "error"; }
    rows = await res.json();
  }
  if (!rows.length) return null;
  const lat = Number(rows[0].lat), lng = Number(rows[0].lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

async function refreshCoordinates(admin: SupabaseClient, c: Clinic): Promise<"ok" | "not_found" | "error" | "cached"> {
  const key = addressKey(c);
  if (c.geocoded_address === key) return "cached";
  const r = await geocode(admin, c);
  const status = r === "error" ? "error" : r ? "ok" : "not_found";
  await admin.from("clinics").update({
    latitude: r && r !== "error" ? r.lat : null,
    longitude: r && r !== "error" ? r.lng : null,
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
  const { data: final } = await admin.from("clinics").select("geocode_status").eq("id", p.clinicId).single();
  return json({ saved: true, geocode: status === "cached" ? final?.geocode_status ?? null : status });
});
