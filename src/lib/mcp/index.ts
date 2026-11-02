import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyAppointments from "./tools/list-my-appointments";
import getMyPoints from "./tools/get-my-points";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "smilecheck-app",
  title: "SmileCheck App",
  version: "0.1.0",
  instructions:
    "Tools for SmileCheck, acting as the signed-in user. Read the user's appointments and their gamification level and reward points.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMyAppointments, getMyPoints],
});
