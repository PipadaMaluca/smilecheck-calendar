import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initThemeAtBoot } from "./hooks/useTheme";

initThemeAtBoot();
createRoot(document.getElementById("root")!).render(<App />);
