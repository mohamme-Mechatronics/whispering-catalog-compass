// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Pre-bundle libraries that are only loaded lazily (catalog viewer), so Vite never
    // re-optimizes mid-session and leaves the open page pointing at a stale module.
    optimizeDeps: { include: ["react-zoom-pan-pinch", "pdfjs-dist"] },
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        manifest: false,
        filename: "sw.js",
        workbox: {
          // SSR app: no index.html fallback; navigations are network-first.
          navigateFallback: null,
          // Includes the PDF reader worker (.mjs) and its font helpers so saved catalogs open offline.
          globPatterns: ["**/*.{js,mjs,css,woff2,png,svg,ico}", "pdfjs/**/*"],
          // Server bundle files are not downloadable; listing them makes the offline helper fail to install.
          globIgnores: ["server/**", "**/node_modules/**"],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          // New versions take over right away instead of waiting for every tab to close.
          skipWaiting: true,
          clientsClaim: true,
          // Build output lives under client/ but is served from the site root.
          modifyURLPrefix: { "client/": "" },
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              // Always try the live page first so an old saved copy is never shown when online.
              handler: "NetworkFirst",
              options: { cacheName: "rafal-pages", networkTimeoutSeconds: 4 },
            },
            {
              // Catalog list / details server functions (GET): always wait for live data when online (the
              // screen already shows the saved list instantly), saved copy only when the network fails.
              // No timeout: on slow phone networks a timeout served the old list and hid new catalogs.
              urlPattern: ({ url, request }) =>
                request.method === "GET" && url.pathname.startsWith("/_serverFn"),
              handler: "NetworkFirst",
              options: { cacheName: "rafal-api" },
            },
            {
              // Catalog cover images: signed links change, so cache by path only.
              urlPattern: ({ url }) => url.pathname.includes("/storage/v1/object/sign/"),
              handler: "CacheFirst",
              options: {
                cacheName: "rafal-covers",
                expiration: { maxEntries: 300 },
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }) => {
                      const u = new URL(request.url);
                      return u.origin + u.pathname;
                    },
                  },
                ],
              },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "rafal-assets" },
            },
            {
              urlPattern: ({ url }) =>
                /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|unpkg\.com/.test(url.host),
              handler: "CacheFirst",
              options: { cacheName: "rafal-cdn", expiration: { maxEntries: 200 } },
            },
          ],
        },
      }),
    ],
  },
});
