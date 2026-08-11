import { defineConfig } from "vite";
import { resolve } from "path";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.js";

export default defineConfig({
  root: resolve(__dirname, "src"),
  build: {
    outDir: resolve(__dirname, "dist-extension"),
    sourcemap: "inline",
    commonjsOptions: {
      // Ensures Vite handles local symlinked dependencies cleanly
      include: [/black-no-sugar/, /node_modules/],
    },
    rollupOptions: {
      output: {
        // Ensures your files keep their clean names instead of messy hashes
        entryFileNames: "extension/[name].js",
        chunkFileNames: "extension/[name].js",
        assetFileNames: "extension/[name].[ext]",
      },
    },
  },
  plugins: [crx({ manifest })],
  optimizeDeps: {
    //include: ["black-no-sugar"],
  },
  resolve: {
    alias: {
      // Directs Vite to the uncompiled source folder instead of node_modules/dist
      //"black-no-sugar": resolve(__dirname, "../black-no-sugar/src/index.ts"),
    },
  },
  server: {
    fs: {
      // Allows Vite to reach up out of your extension root to fetch black-no-sugar source
      //allow: [".."],
    },
    port: 5173, // The extension HMR server will run here
    strictPort: true,
  },
});
