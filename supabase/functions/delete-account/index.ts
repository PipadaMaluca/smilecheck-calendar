import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { createStripeClient } from "../_shared/stripe.ts";
import { activeEnv } from "../_shared/paymentsGuard.ts";

// The client must type the confirmation word of its language.
const Body = z.object({ confirm: z.enum(["ELIMINAR", "SUPPRIMER", "DELETE"]) });
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let requestId: string | null = null;
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Unauthorized" }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "confirmation_required" }, 400);

    const { data: prof } = await admin.from("profiles").select("is_seed").eq("id", user.id).maybeSingle();
    if (prof?.is_seed) return json({ error: "seed_account" }, 403);

    const { data: reqRow } = await admin.from("account_deletion_requests")
      .insert({ profile_id: user.id }).select("id").single();
    requestId = reqRow?.id ?? null;

    // 1. Cancel every live/pending subscription in Stripe (active environment only).
    const env = activeEnv();
    const { data: subs } = await admin.from("subscriptions").select("stripe_subscription_id, status")
      .eq("user_id", user.id).eq("environment", env);
    let canceled = 0;
    const open = (subs ?? []).filter((s) => !["canceled", "incomplete_expired"].includes(s.status));
    if (open.length) {
      const stripe = createStripeClient(env);
      for (const s of open) {
        try { await stripe.subscriptions.cancel(s.stripe_subscription_id); canceled++; }
        catch (e) { console.error("cancel failed", e instanceof Error ? e.message : e); }
      }
    }

    // 2. Delete / anonymise account data. Clinical records stay with the professional.
    const { data: removed, error: anonError } = await admin.rpc("anonymize_account", { _uid: user.id });
    if (anonError) throw new Error(anonError.message);

    // 3. Sign-in is disabled for good and the e-mail is released.
    await admin.auth.admin.updateUserById(user.id, {
      email: `deleted-${user.id}@deleted.invalid`,
      ban_duration: "876000h",
      user_metadata: {},
    });

    await admin.from("account_deletion_requests").update({
      status: "completed", completed_at: new Date().toISOString(),
      detail: { ...(removed as Record<string, unknown>), subscriptions_canceled: canceled },
    }).eq("id", requestId);
    return json({ ok: true });
  } catch (e) {
    console.error("delete-account error", e instanceof Error ? e.message : e);
    if (requestId) await admin.from("account_deletion_requests").update({ status: "failed" }).eq("id", requestId);
    return json({ error: "Deletion failed" }, 500);
  }
});
