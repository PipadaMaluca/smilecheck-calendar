import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      devOptions: { enabled: false },
      filename: "sw.js",
      includeAssets: ["favicon-32.png", "favicon-192.png", "offline.html"],
      manifest: {
        id: "/",
        name: "SmileCheck",
        short_name: "SmileCheck",
        description: "Agenda, teleconsulta e dossier dentário — Portugal e França.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#021931",
        theme_color: "#0D2137",
        icons: [
          { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell + static assets only. Never API responses or health data.
        globPatterns: ["**/*.{js,css,html,woff2,svg,webp}"],
        globIgnores: ["**/lovable-uploads/**", "**/*.mp4"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "sc-pages",
              networkTimeoutSeconds: 4,
              plugins: [{ handlerDidError: async () => (await (globalThis as any).caches.match("/offline.html")) ?? Response.error() }],
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/assets/") && /-[A-Za-z0-9_-]{8,}\.(js|css)$/.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "sc-hashed-assets", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
