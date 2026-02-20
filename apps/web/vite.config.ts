import { URL, fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  envDir: fileURLToPath(new URL("../..", import.meta.url)),
  plugins: [tailwindcss(), vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@kresus/contract": fileURLToPath(
        new URL("../../packages/contract/src/index.ts", import.meta.url),
      ),
    },
  },
});
