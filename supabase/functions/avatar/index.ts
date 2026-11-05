import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Stable, non-expiring profile photo URL: GET /avatar?u=<profile id>&v=<version>.
 * "public" photos go to anyone; "contacts" photos only to the owner and people
 * related to them (`can_view_avatar`). Everyone else gets 404 → initials.
 * The bucket stays private; only this function (service role) reads it.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cors = { ...corsHeaders, "Access-Control-Expose-Headers": "ETag" };
const notFound = () => new Response("Not found", { status: 404, headers: { ...cors, "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: cors });
  try {
    const owner = new URL(req.url).searchParams.get("u") ?? "";
    if (!UUID.test(owner)) return notFound();
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let viewer: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data } = await userClient.auth.getClaims(auth.slice(7));
      if (data?.claims?.role === "authenticated" && typeof data.claims.sub === "string") viewer = data.claims.sub;
    }

    const { data: prof } = await admin.from("profiles").select("avatar_url, avatar_visibility").eq("id", owner).maybeSingle();
    const version = prof?.avatar_url?.match(/[?&]v=(\d{1,16})$/)?.[1];
    if (!version) return notFound();
    const { data: allowed } = await admin.rpc("can_view_avatar", { _viewer: viewer, _owner: owner });
    if (allowed !== true) return notFound();

    const isPublic = prof!.avatar_visibility === "public";
    const etag = `"${owner}-${version}-${isPublic ? "p" : "c"}"`;
    const headers = {
      ...cors,
      "Content-Type": "image/webp",
      ETag: etag,
      "Cache-Control": isPublic ? "public, max-age=3600, stale-while-revalidate=86400" : "private, max-age=600",
      Vary: "Authorization",
      "X-Content-Type-Options": "nosniff",
    };
    if (req.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers });

    const { data: file, error } = await admin.storage.from("avatars").download(`${owner}/avatar-${version}.webp`);
    if (error || !file) return notFound();
    return new Response(req.method === "HEAD" ? null : file, { status: 200, headers });
  } catch {
    return notFound();
  }
});
