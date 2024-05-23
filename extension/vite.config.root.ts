import { mergeConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import svgr from "vite-plugin-svgr"
import polyfill from "@initia/vite-config-node-polyfills"

export const base = mergeConfig(polyfill, {
  build: { target: "esnext" },
  clearScreen: false,
})

export const app = mergeConfig(base, {
  plugins: [react(), svgr()],
  envPrefix: "INITIA_",
})

export default app
