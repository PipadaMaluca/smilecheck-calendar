import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_points",
  title: "Get my points and level",
  description: "Return the signed-in user's level, lifetime XP, spendable reward points and streak.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Not signed in.");
    const { data, error } = await supabaseForUser(ctx)
      .from("user_levels")
      .select("level, current_xp, current_reward_points, streak_days, best_streak")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new ToolError("Could not load points.");
    const points = data
      ? {
          level: String(data.level),
          xp: Number(data.current_xp),
          reward_points: Number(data.current_reward_points),
          streak_days: Number(data.streak_days),
          best_streak: Number(data.best_streak),
        }
      : null;
    return {
      content: [{ type: "text", text: JSON.stringify(points) }],
      structuredContent: { points },
    };
  },
});
