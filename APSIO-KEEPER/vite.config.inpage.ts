import { defineConfig } from "vite";
import { sharedConfig } from "./vite.config";
import { r, isDev } from "./scripts/utils";
import packageJson from "./package.json";
import nodePolyFills from 'rollup-plugin-polyfill-node';

// bundling the content script using Vite
export default defineConfig({
  ...sharedConfig,
  build: {
    watch: isDev
      ? {
          include: [r("src/inpage/**/*")],
        }
      : undefined,
    outDir: r("extension/dist/"),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? "inline" : "inline",
    lib: {
      entry: r("src/inpage/index.ts"),
      name: packageJson.name,
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "inpage.js",
        extend: true,
      },
      plugins: [
        nodePolyFills()
      ]
    },
  },
  plugins: [...sharedConfig.plugins!],
});