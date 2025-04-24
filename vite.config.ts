import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { vercelPreset } from "@vercel/remix/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      presets: [vercelPreset()],
      serverModuleFormat: "esm",
      appDirectory: "app",
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
    },
  },
});
