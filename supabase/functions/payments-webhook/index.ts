import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";
import { shouldSyncPlan } from "../_shared/paymentsGuard.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_supabase) _supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  return _supabase;
}

const iso = (s?: number | null) => (s ? new Date(s * 1000).toISOString() : null);

async function upsertSubscription(sub: any, env: StripeEnv) {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const periodStart = item?.current_period_start ?? sub.current_period_start;
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  let userId: string | undefined = sub.metadata?.userId;
  if (!userId) {
    const { data } = await db().from("subscriptions").select("user_id").eq("stripe_subscription_id", sub.id).maybeSingle();
    userId = (data as { user_id?: string } | null)?.user_id;
  }
  if (!userId) { console.error("subscription without userId"); return; }

  await db().from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    product_id: typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id ?? "",
    price_id: priceId ?? "",
    status: sub.status,
    current_period_start: iso(periodStart),
    current_period_end: iso(periodEnd),
    cancel_at_period_end: sub.cancel_at_period_end || false,
    ...(typeof sub.metadata?.withdrawalWaiverAt === "string" && !Number.isNaN(Date.parse(sub.metadata.withdrawalWaiverAt))
      && { withdrawal_waiver_at: new Date(sub.metadata.withdrawalWaiverAt).toISOString() }),
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  // profiles.plan is only ever written here, by the server (trusted write inside the RPC).
  // Events from a non-active environment are recorded but never change the plan
  // (sync_profile_plan re-checks this against payment_settings).
  if (!shouldSyncPlan(env)) return;
  await db().rpc("sync_profile_plan", { _user_id: userId, _env: env });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), { status: 200 });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscription(event.data.object, env);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Webhook error:", e instanceof Error ? e.message : e);
    return new Response("Webhook error", { status: 400 });
  }
});
