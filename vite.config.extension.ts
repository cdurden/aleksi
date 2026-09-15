import { defineConfig } from "vite";
import { resolve } from "path";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.js";

export default defineConfig(({ command }) => {
  const isProd = command === "build";

  return {
    root: resolve(__dirname, "src"),
    build: {
      outDir: resolve(__dirname, "dist-extension"),
      emptyOutDir: true,

      // 1. Turn OFF heavy inline sourcemaps for production builds
      sourcemap: isProd ? false : "inline",

      // 2. COMPLETELY DISABLE MINIFICATION FOR STORE REVIEW EXPENDITING
      // This preserves all whitespace, line breaks, and variable names.
      minify: false,

      commonjsOptions: {
        include: [/black-no-sugar/, /node_modules/],
      },
      rollupOptions: {
        output: {
          entryFileNames: "extension/[name].js",
          chunkFileNames: "extension/[name].js",
          assetFileNames: "extension/[name].[ext]",

          // 3. Prevent Vite/Rollup from creating separate chunk files
          manualChunks: undefined,
        },
      },
    },
    plugins: [crx({ manifest })],

    server: {
      fs: {
        allow: [".."],
      },
      port: 5173,
      strictPort: true,
    },
  };
});
