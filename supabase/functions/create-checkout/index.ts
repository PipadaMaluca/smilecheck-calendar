import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { createStripeClient } from "../_shared/stripe.ts";
import { resolveEnv, safeReturnUrl } from "../_shared/paymentsGuard.ts";

const PRICE_IDS = [
  "patient_pro_monthly", "patient_pro_yearly", "patient_premium_monthly", "patient_premium_yearly",
  "dentist_pro_monthly", "dentist_pro_yearly", "dentist_premium_monthly", "dentist_premium_yearly",
  "clinic_pro_monthly", "clinic_pro_yearly", "clinic_premium_monthly", "clinic_premium_yearly",
] as const;

const Body = z.object({
  priceId: z.enum(PRICE_IDS),
  returnUrl: z.string().max(500).optional(),
  environment: z.enum(["sandbox", "live"]).optional(),
  locale: z.enum(["pt", "fr", "en"]).optional(),
  // Consumers (patients) must request immediate start and acknowledge losing the 14-day withdrawal right.
  withdrawalWaiver: z.boolean().optional(),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { priceId, locale } = parsed.data;
    // Server decides the environment; a client asking for another one is refused.
    const environment = resolveEnv(parsed.data.environment);
    if (!environment) return json({ error: "environment_not_active" }, 403);
    const returnUrl = safeReturnUrl(parsed.data.returnUrl);

    // A user can only buy plans of their own role (patient/dentist/clinic).
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!profile || !priceId.startsWith(`${profile.role}_`)) return json({ error: "Plan not available for this role" }, 403);
    const isConsumer = profile.role === "patient";
    if (isConsumer && parsed.data.withdrawalWaiver !== true) return json({ error: "withdrawal_waiver_required" }, 400);
    const waiverAt = isConsumer ? new Date().toISOString() : "";

    const stripe = createStripeClient(environment);
    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) return json({ error: "Price not found" }, 404);

    // If there is already an active subscription, plan changes go through the customer portal.
    const { data: existing } = await admin.from("subscriptions").select("id")
      .eq("user_id", user.id).eq("environment", environment)
      .in("status", ["active", "trialing", "past_due"]).limit(1);
    if (existing?.length) return json({ error: "already_subscribed" }, 409);

    const customerId = await resolveOrCreateCustomer(stripe, { email: user.email ?? undefined, userId: user.id });
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      customer: customerId,
      ...(locale && { locale }),
      managed_payments: { enabled: true },
      metadata: { userId: user.id, managed_payments: "true" },
      subscription_data: { metadata: { userId: user.id, ...(waiverAt && { withdrawalWaiverAt: waiverAt }) } },
    } as any);
    return json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error("create-checkout error", e instanceof Error ? e.message : e);
    return json({ error: "Checkout failed" }, 500);
  }
});
