import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  language: z.enum(["pt", "en", "fr"]),
  symptoms: z.array(z.string().max(80)).max(20),
  otherSymptom: z.string().max(500).optional().default(""),
  teeth: z.array(z.string().max(10)).max(32),
  unknownLocation: z.boolean(),
  duration: z.string().max(80),
  painIntensity: z.number().min(0).max(10),
  isRoutineCheckup: z.boolean(),
});

const LANG = { pt: "European Portuguese", en: "English", fr: "French" };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid input" }, 400);
    const d = parsed.data;
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI not configured" }, 500);

    const system = `You are a careful dental triage assistant for a patient app. You never diagnose; you give a preliminary orientation.
Reply ONLY with a JSON object (no markdown) with keys:
"urgency": one of "low" | "moderate" | "urgent",
"specialty": short name of the recommended dental specialty,
"summary": 1-2 plain sentences explaining what the symptoms may suggest, calm tone, no scary terms,
"tips": array of 2-4 short, safe self-care tips until the appointment,
"seekEmergency": boolean, true only for red flags (facial swelling spreading, fever, trouble breathing/swallowing, trauma with heavy bleeding).
Write all text in ${LANG[d.language]}.`;

    const user = `Triage data:
- Routine checkup: ${d.isRoutineCheckup}
- Symptoms: ${d.symptoms.join(", ") || "none"}${d.otherSymptom ? ` (other: ${d.otherSymptom})` : ""}
- Teeth (FDI): ${d.unknownLocation ? "unknown" : d.teeth.join(", ") || "none"}
- Duration: ${d.duration || "n/a"}
- Pain intensity: ${d.painIntensity}/10`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-5",
        max_tokens: 1024,
        stream: true,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      console.error("gateway error", res.status, text);
      let message = "AI request failed";
      try { message = JSON.parse(text)?.error?.message ?? JSON.parse(text)?.message ?? message; } catch { /* ignore */ }
      return json({ error: message }, res.status);
    }

    // Consume SSE stream, accumulate text deltas
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", out = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") out += evt.delta.text;
        } catch { /* ignore */ }
      }
    }

    const match = out.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "Empty AI response" }, 502);
    const result = JSON.parse(match[0]);
    return json({
      urgency: ["low", "moderate", "urgent"].includes(result.urgency) ? result.urgency : "moderate",
      specialty: String(result.specialty ?? ""),
      summary: String(result.summary ?? ""),
      tips: Array.isArray(result.tips) ? result.tips.slice(0, 4).map(String) : [],
      seekEmergency: Boolean(result.seekEmergency),
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Unexpected error" }, 500);
  }
});
