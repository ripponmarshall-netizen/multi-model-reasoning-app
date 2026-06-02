import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves a project site under /<repo>/, so assets must be
// requested with that base path. Override with VITE_BASE_PATH when hosting
// elsewhere (e.g. a custom domain or local preview, where "/" is correct).
const base = process.env.VITE_BASE_PATH ?? "/multi-model-reasoning-app/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
