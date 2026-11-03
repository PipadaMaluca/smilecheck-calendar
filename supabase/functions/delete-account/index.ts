import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { MAX_ATTEMPTS, processDeletion } from "./process.ts";

// User request: the client must type the confirmation word of its language.
// Retry request (daily job): only finishes deletions users already asked for.
const Body = z.union([
  z.object({ confirm: z.enum(["ELIMINAR", "SUPPRIMER", "DELETE"]) }),
  z.object({ mode: z.literal("retry") }),
]);
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));

  // Daily retry of pending requests. Harmless to trigger: it only completes deletions users confirmed.
  if (parsed.success && "mode" in parsed.data) {
    const { data: pending } = await admin.from("account_deletion_requests")
      .select("id, profile_id, attempts").eq("status", "pending").lt("attempts", MAX_ATTEMPTS)
      .order("requested_at").limit(20);
    let done = 0;
    for (const r of pending ?? []) {
      try {
        if ((await processDeletion(admin, r.profile_id, r.id, r.attempts)).ok) done++;
      } catch (e) {
        await admin.from("account_deletion_requests").update({
          attempts: r.attempts + 1, last_attempt_at: new Date().toISOString(),
          last_error: (e instanceof Error ? e.message : String(e)).slice(0, 200),
        }).eq("id", r.id);
      }
    }
    return json({ processed: pending?.length ?? 0, completed: done });
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!parsed.success) return json({ error: "confirmation_required" }, 400);

  const { data: prof } = await admin.from("profiles").select("is_seed").eq("id", user.id).maybeSingle();
  if (prof?.is_seed) return json({ error: "seed_account" }, 403);

  // Re-use an open request instead of piling up duplicates.
  const { data: existing } = await admin.from("account_deletion_requests")
    .select("id, attempts").eq("profile_id", user.id).eq("status", "pending").maybeSingle();
  let requestId = existing?.id as string | undefined;
  const attempts = (existing?.attempts as number | undefined) ?? 0;
  if (!requestId) {
    const { data: row, error } = await admin.from("account_deletion_requests")
      .insert({ profile_id: user.id }).select("id").single();
    if (error || !row) return json({ error: "Deletion failed" }, 500);
    requestId = row.id;
  }
  try {
    const res = await processDeletion(admin, user.id, requestId!, attempts);
    if (!res.ok) return json({ error: "subscription_cancel_failed", pending: true }, 502);
    return json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("delete-account error", msg);
    await admin.from("account_deletion_requests").update({
      status: "pending", attempts: attempts + 1, last_attempt_at: new Date().toISOString(), last_error: msg.slice(0, 200),
    }).eq("id", requestId);
    return json({ error: "Deletion failed", pending: true }, 500);
  }
});
