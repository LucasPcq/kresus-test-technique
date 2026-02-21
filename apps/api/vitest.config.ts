import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: false,
  test: {
    globals: true,
    root: "./",
  },
  // @ts-ignore unplugin-swc targets Vite <7, types are incompatible but runtime works
  plugins: [swc.vite()],
});
