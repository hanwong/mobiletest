import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
  plugins: [nodePolyfills({ globals: { Buffer: true, global: true, process: true } }), react()],
  build: { target: "esnext" },
})
