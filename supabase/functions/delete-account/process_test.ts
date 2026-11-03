import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { processDeletion } from "./process.ts";

Deno.env.set("PAYMENTS_ACTIVE_ENV", "sandbox");

// Minimal fake of the admin client: records updates and RPC calls.
function fakeAdmin(subs: { stripe_subscription_id: string; status: string }[]) {
  const log = { updates: [] as Record<string, unknown>[], rpc: [] as string[], banned: false };
  const chain = (result: unknown) => {
    const q: any = { select: () => q, eq: () => q, then: (r: any) => Promise.resolve(result).then(r) };
    return q;
  };
  const admin: any = {
    from: (table: string) => ({
      select: () => chain({ data: table === "subscriptions" ? subs : [], error: null }),
      update: (v: Record<string, unknown>) => { log.updates.push(v); return chain({ error: null }); },
    }),
    rpc: (name: string) => { log.rpc.push(name); return Promise.resolve({ data: {}, error: null }); },
    auth: { admin: { updateUserById: () => { log.banned = true; return Promise.resolve({}); } } },
  };
  return { admin, log };
}

Deno.test("deletion: Stripe cancel failure deletes nothing and leaves the request pending", async () => {
  const { admin, log } = fakeAdmin([{ stripe_subscription_id: "sub_1", status: "active" }]);
  const res = await processDeletion(admin, "u1", "r1", 0, () => Promise.reject(new Error("gateway timeout")));
  assertEquals(res.ok, false);
  assertEquals(log.rpc, []);           // anonymize_account never called
  assertEquals(log.banned, false);     // sign-in untouched
  assertEquals(log.updates[0].status, "pending");
  assertEquals(log.updates[0].attempts, 1);
});

Deno.test("deletion: subscriptions cancelled first, then account anonymised", async () => {
  const { admin, log } = fakeAdmin([{ stripe_subscription_id: "sub_1", status: "active" }]);
  const cancelled: string[] = [];
  const res = await processDeletion(admin, "u1", "r1", 0, (id) => { cancelled.push(id); return Promise.resolve(); });
  assertEquals(res.ok, true);
  assertEquals(cancelled, ["sub_1"]);
  assertEquals(log.rpc, ["anonymize_account"]);
  assertEquals(log.updates.at(-1)?.status, "completed");
});
