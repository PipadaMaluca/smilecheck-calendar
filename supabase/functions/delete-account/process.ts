import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient } from "../_shared/stripe.ts";
import { activeEnv } from "../_shared/paymentsGuard.ts";

export const MAX_ATTEMPTS = 10;

/** Cancels Stripe subscriptions first; if ANY cancel fails nothing is deleted and the request stays pending. */
export async function processDeletion(
  admin: SupabaseClient, userId: string, requestId: string, attempts: number,
  cancel?: (subscriptionId: string) => Promise<unknown>,
) {
  const now = new Date().toISOString();
  const env = activeEnv();
  const { data: subs, error: subsError } = await admin.from("subscriptions")
    .select("stripe_subscription_id, status").eq("user_id", userId).eq("environment", env);
  if (subsError) throw new Error(subsError.message);
  const open = (subs ?? []).filter((s) => !["canceled", "incomplete_expired"].includes(s.status));
  const failures: string[] = [];
  if (open.length) {
    const doCancel = cancel ?? ((id: string) => createStripeClient(env).subscriptions.cancel(id));
    for (const s of open) {
      try {
        await doCancel(s.stripe_subscription_id);
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

