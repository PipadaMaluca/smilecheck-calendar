// Server-side payment guards: single active environment, safe return URLs, constant-time compare.
export type PaymentsEnv = "sandbox" | "live";

/** The only environment the server acts on. Must match public.payment_settings.active_env. */
export function activeEnv(): PaymentsEnv {
  const v = Deno.env.get("PAYMENTS_ACTIVE_ENV");
  if (v === "sandbox" || v === "live") return v;
  return "sandbox"; // fail closed: never silently route to live
}

/** Returns the active env, or null when the client asked for a different one (request refused). */
export function resolveEnv(requested: unknown): PaymentsEnv | null {
  const active = activeEnv();
  if (requested === undefined || requested === null) return active;
  return requested === active ? active : null;
}

const DEFAULT_ORIGIN = "https://id-preview--32406e4d-a317-44f1-9a40-adff5c8d9619.lovable.app";

function allowedOrigin(origin: string): boolean {
  let u: URL;
  try { u = new URL(origin); } catch { return false; }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  const extra = (Deno.env.get("APP_ALLOWED_ORIGINS") ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    .map((s) => { try { return new URL(s).hostname; } catch { return s; } });
  if (extra.includes(host)) return true;
  return host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com");
}

/** Keeps the URL only if it belongs to the app; otherwise falls back to the default app origin. */
export function safeReturnUrl(url: string | undefined, fallbackPath = "/"): string {
  const fallbackOrigin = Deno.env.get("APP_DEFAULT_ORIGIN") || DEFAULT_ORIGIN;
  if (url) {
    try {
      const u = new URL(url);
      if (allowedOrigin(u.origin) && !u.username && !u.password) return url; // keep verbatim (Stripe's {CHECKOUT_SESSION_ID} placeholder)
    } catch { /* fall through */ }
  }
  return `${fallbackOrigin}${fallbackPath}`;
}

/** Constant-time string comparison (length leak only). */
export function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  const n = Math.max(ea.length, eb.length);
  for (let i = 0; i < n; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

/** Only events from the active environment may change profiles.plan. */
export function shouldSyncPlan(env: string): boolean {
  return env === activeEnv();
}
