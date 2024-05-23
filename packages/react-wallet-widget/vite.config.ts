import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

const external = [new RegExp("^@initia/.*"), new RegExp("^cosmjs-types"), "react", "rxjs"]

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: { entry: resolve(__dirname, "src/index.ts"), fileName: "index", formats: ["es"] },
    rollupOptions: { external },
  },
})
