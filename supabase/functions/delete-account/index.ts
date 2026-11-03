import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { createStripeClient } from "../_shared/stripe.ts";
import { activeEnv } from "../_shared/paymentsGuard.ts";

// User request: the client must type the confirmation word of its language.
// Retry request (daily job): only finishes deletions users already asked for.
const Body = z.union([
  z.object({ confirm: z.enum(["ELIMINAR", "SUPPRIMER", "DELETE"]) }),
  z.object({ mode: z.literal("retry") }),
]);
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_ATTEMPTS = 10;

/** Cancels Stripe subscriptions first; if ANY cancel fails nothing is deleted and the request stays pending. */
async function processDeletion(admin: SupabaseClient, userId: string, requestId: string, attempts: number) {
  const now = new Date().toISOString();
  const env = activeEnv();
  const { data: subs, error: subsError } = await admin.from("subscriptions")
    .select("stripe_subscription_id, status").eq("user_id", userId).eq("environment", env);
  if (subsError) throw new Error(subsError.message);
  const open = (subs ?? []).filter((s) => !["canceled", "incomplete_expired"].includes(s.status));
  const failures: string[] = [];
  if (open.length) {
    const stripe = createStripeClient(env);
    for (const s of open) {
      try {
        await stripe.subscriptions.cancel(s.stripe_subscription_id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Already canceled on Stripe's side counts as done.
        if (/No such subscription|already been canceled|status of canceled/i.test(msg)) continue;
        failures.push(msg.slice(0, 200));
      }
    }
  }
  if (failures.length) {
    await admin.from("account_deletion_requests").update({
      status: "pending", attempts: attempts + 1, last_attempt_at: now,
      last_error: `stripe_cancel_failed: ${failures[0]}`,
    }).eq("id", requestId);
    // Support alert: kept on the pending row (status, attempts, last_error) and in the function logs.
    console.error("SUPPORT_ALERT account deletion blocked by Stripe cancel failure", { requestId, attempts: attempts + 1 });
    return { ok: false as const };
  }

  const { data: removed, error: anonError } = await admin.rpc("anonymize_account", { _uid: userId });
  if (anonError) throw new Error(anonError.message);

  await admin.auth.admin.updateUserById(userId, {
    email: `deleted-${userId}@deleted.invalid`,
    ban_duration: "876000h",
    user_metadata: {},
  });

  await admin.from("account_deletion_requests").update({
    status: "completed", completed_at: now, last_attempt_at: now, attempts: attempts + 1, last_error: null,
    detail: { ...(removed as Record<string, unknown>), subscriptions_canceled: open.length },
  }).eq("id", requestId);
  return { ok: true as const };
}

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
