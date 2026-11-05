import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * The only way to open a private clinical file or message attachment.
 * Access check + access log run in the caller's own session (RPCs
 * `open_clinical_document` / `open_message_attachment`); only then the
 * service role signs a 60-second URL. Clients have no SELECT on these buckets.
 */
const SECONDS = 60;
const Body = z.object({ kind: z.enum(["clinical", "message"]), id: z.string().uuid() });
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: authError } = await userClient.auth.getClaims(authHeader.slice(7));
    if (authError || !claims?.claims?.sub || claims.claims.role !== "authenticated") return json({ error: "Unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid input" }, 400);
    const { kind, id } = parsed.data;
    const fn = kind === "clinical" ? "open_clinical_document" : "open_message_attachment";
    const { data: path, error } = await userClient.rpc(fn, { _id: undefined, ...(kind === "clinical" ? { _id: id } : { _message_id: id }) });
    if (error || typeof path !== "string") return json({ error: "Forbidden" }, 403);

    const bucket = kind === "clinical" ? "clinical-documents" : "message-attachments";
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: signed, error: signError } = await admin.storage.from(bucket).createSignedUrl(path, SECONDS);
    if (signError || !signed?.signedUrl) return json({ error: "Sign failed" }, 500);
    return json({ url: signed.signedUrl, expiresIn: SECONDS });
  } catch {
    return json({ error: "Server error" }, 500);
  }
});
