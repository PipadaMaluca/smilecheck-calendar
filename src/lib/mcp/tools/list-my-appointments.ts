import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_appointments",
  title: "List my appointments",
  description: "List the signed-in user's appointments (as patient or professional), upcoming by default.",
  inputSchema: {
    scope: z.enum(["upcoming", "past", "all"]).default("upcoming").describe("Which appointments to return."),
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum number of appointments."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ scope, limit }, ctx) => {
    const supabase = supabaseForUser(ctx);
    const now = new Date().toISOString();
    let query = supabase
      .from("appointments")
      .select("id, scheduled_at, duration_minutes, status, consultation_type, is_teleconsultation, clinic_id, dentist_id")
      .limit(limit);
    if (scope === "upcoming") query = query.gte("scheduled_at", now).order("scheduled_at", { ascending: true });
    else if (scope === "past") query = query.lt("scheduled_at", now).order("scheduled_at", { ascending: false });
    else query = query.order("scheduled_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw new ToolError("Could not load appointments.");
    const appointments = (data ?? []).map((a) => ({
      id: String(a.id),
      scheduled_at: String(a.scheduled_at),
      duration_minutes: Number(a.duration_minutes),
      status: String(a.status),
      consultation_type: String(a.consultation_type),
      is_teleconsultation: Boolean(a.is_teleconsultation),
      clinic_id: a.clinic_id ? String(a.clinic_id) : null,
      dentist_id: a.dentist_id ? String(a.dentist_id) : null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(appointments) }],
      structuredContent: { appointments },
    };
  },
});
