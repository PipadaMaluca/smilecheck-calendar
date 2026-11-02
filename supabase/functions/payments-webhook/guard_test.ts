import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";
import { resolveEnv, safeReturnUrl, shouldSyncPlan, timingSafeEqual } from "../_shared/paymentsGuard.ts";
import { verifyWebhook } from "../_shared/stripe.ts";

Deno.env.set("PAYMENTS_ACTIVE_ENV", "sandbox");

Deno.test("checkout: environment different from the active one is refused", () => {
  assertEquals(resolveEnv("live"), null);
  assertEquals(resolveEnv("sandbox"), "sandbox");
  assertEquals(resolveEnv(undefined), "sandbox");
});

Deno.test("returnUrl: external URL is replaced by the app origin", () => {
  const out = safeReturnUrl("https://evil.example.com/steal");
  assert(!out.includes("evil"));
  assert(new URL(out).hostname.endsWith(".lovable.app"));
  assertEquals(safeReturnUrl("https://evil.lovable.app.attacker.com/x").includes("attacker"), false);
  assertEquals(safeReturnUrl("javascript:alert(1)").startsWith("https://"), true);
  const ok = "https://id-preview--x.lovable.app/app?session_id={CHECKOUT_SESSION_ID}";
  assertEquals(safeReturnUrl(ok), ok);
});

async function sign(secret: string, body: string) {
  const t = Math.floor(Date.now() / 1000).toString();
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${body}`));
  return `t=${t},v1=${new TextDecoder().decode(encode(new Uint8Array(sig)))}`;
}

Deno.test("webhook: signed event from non-active environment never changes the plan", async () => {
  Deno.env.set("PAYMENTS_LIVE_WEBHOOK_SECRET", "whsec_test_live");
  const body = JSON.stringify({ type: "customer.subscription.created", data: { object: { id: "sub_1" } } });
  const req = new Request("https://x/payments-webhook?env=live", { method: "POST", body, headers: { "stripe-signature": await sign("whsec_test_live", body) } });
  const event = await verifyWebhook(req, "live"); // signature is valid…
  assertEquals(event.type, "customer.subscription.created");
  assertEquals(shouldSyncPlan("live"), false); // …but the plan is not synced
  assertEquals(shouldSyncPlan("sandbox"), true);
});

Deno.test("webhook: forged signature rejected; compare is constant-time", async () => {
  Deno.env.set("PAYMENTS_SANDBOX_WEBHOOK_SECRET", "whsec_real");
  const body = "{}";
  const req = new Request("https://x", { method: "POST", body, headers: { "stripe-signature": await sign("whsec_wrong", body) } });
  let failed = false;
  try { await verifyWebhook(req, "sandbox"); } catch { failed = true; }
  assert(failed);
  assert(timingSafeEqual("abc", "abc"));
  assert(!timingSafeEqual("abc", "abd"));
  assert(!timingSafeEqual("abc", "abcd"));
});
