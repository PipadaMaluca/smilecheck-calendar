import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

function supabaseProjectUrl(): string {
  const url = process.env["SUPABASE_URL"];
  if (!url) throw new Error("SUPABASE_URL is not set");
  return url;
}

function supabasePublishableKey(): string {
  const key = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!key) throw new Error("Supabase publishable key is not set");
  return key;
}

export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  return createClient(supabaseProjectUrl(), supabasePublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
