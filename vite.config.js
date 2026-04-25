import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react-vendor";
          }

          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }

          if (
            id.includes("node_modules/socket.io-client") ||
            id.includes("node_modules/engine.io-client") ||
            id.includes("node_modules/socket.io-parser")
          ) {
            return "realtime-vendor";
          }

          if (id.includes("node_modules/recharts/")) {
            return "charts-vendor";
          }

          if (
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/@heroicons/") ||
            id.includes("node_modules/@hugeicons/")
          ) {
            return "icons-vendor";
          }

          if (id.includes("node_modules/firebase/") || id.includes("node_modules/@firebase/")) {
            return "firebase-vendor";
          }

          if (id.includes("node_modules/axios/")) {
            return "http-vendor";
          }

          if (
            id.includes("node_modules/zustand/") ||
            id.includes("node_modules/sonner/")
          ) {
            return "state-vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    allowedHosts: [
      "tariff-heath-dividend-ordinance.trycloudflare.com",
    ],
  },
});
