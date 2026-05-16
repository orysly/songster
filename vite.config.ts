import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.svg", "icons/icon-512.svg"],
      manifest: {
        name: "Timeline Tracks",
        short_name: "Tracks",
        description: "A private one-phone Spotify timeline party game.",
        theme_color: "#101820",
        background_color: "#101820",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.spotify\.com\/.*/i,
            handler: "NetworkOnly",
            options: { cacheName: "spotify-api-network-only" }
          },
          {
            urlPattern: /^https:\/\/sdk\.scdn\.co\/.*/i,
            handler: "NetworkOnly",
            options: { cacheName: "spotify-sdk-network-only" }
          }
        ]
      }
    })
  ]
});
