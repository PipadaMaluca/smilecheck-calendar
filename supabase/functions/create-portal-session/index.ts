import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { createStripeClient } from "../_shared/stripe.ts";
import { resolveEnv, safeReturnUrl } from "../_shared/paymentsGuard.ts";

const ROLE_PRICES = (role: string) => ["pro_monthly", "pro_yearly", "premium_monthly", "premium_yearly"].map((p) => `${role}_${p}`);

// Portal config per role: plan switches apply immediately with prorated charge,
// cancellations take effect at the end of the paid period.
async function portalConfigFor(stripe: ReturnType<typeof createStripeClient>, role: string) {
  const list = await stripe.billingPortal.configurations.list({ limit: 100, active: true });
  const found = list.data.find((c: any) => c.metadata?.smilecheck_role === role);
  if (found) return found.id;
  const prices = await stripe.prices.list({ lookup_keys: ROLE_PRICES(role), limit: 10 });
  const byProduct = new Map<string, string[]>();
  for (const pr of prices.data) {
    const prod = typeof pr.product === "string" ? pr.product : pr.product.id;
    byProduct.set(prod, [...(byProduct.get(prod) ?? []), pr.id]);
  }
  const cfg = await stripe.billingPortal.configurations.create({
    metadata: { smilecheck_role: role },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "always_invoice",
        products: [...byProduct.entries()].map(([product, prices]) => ({ product, prices })),
      },
    },
  } as any);
  return cfg.id;
}

const Body = z.object({ returnUrl: z.string().max(500).optional(), environment: z.enum(["sandbox", "live"]).optional() });
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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
    const environment = resolveEnv(parsed.data.environment);
    if (!environment) return json({ error: "environment_not_active" }, 403);

    const { data: sub } = await admin.from("subscriptions").select("stripe_customer_id")
      .eq("user_id", user.id).eq("environment", environment)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found" }, 404);

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const stripe = createStripeClient(environment);
    const configuration = await portalConfigFor(stripe, profile?.role ?? "patient");
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      configuration,
      return_url: safeReturnUrl(parsed.data.returnUrl),
    });
    return json({ url: portal.url });
  } catch (e) {
    console.error("portal error", e instanceof Error ? e.message : e);
    return json({ error: "Portal failed" }, 500);
  }
});
