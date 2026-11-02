import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { createStripeClient } from "../_shared/stripe.ts";

const Body = z.object({ returnUrl: z.string().url().max(500), environment: z.enum(["sandbox", "live"]) });
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

    const { data: sub } = await admin.from("subscriptions").select("stripe_customer_id")
      .eq("user_id", user.id).eq("environment", parsed.data.environment)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found" }, 404);

    const stripe = createStripeClient(parsed.data.environment);
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: parsed.data.returnUrl,
    });
    return json({ url: portal.url });
  } catch (e) {
    console.error("portal error", e instanceof Error ? e.message : e);
    return json({ error: "Portal failed" }, 500);
  }
});
