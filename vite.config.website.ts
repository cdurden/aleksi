import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "src"),
  server: {
    port: 5174,
    open: true, // Automatically opens http://localhost:3000 in your browser
  },
  build: {
    outDir: resolve(__dirname, "dist-website"),
  },
});
