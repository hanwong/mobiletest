import { defineConfig } from "vite"

const external = ["react"]

export default defineConfig({
  build: {
    lib: { entry: "index.ts", fileName: "index", formats: ["es"] },
    rollupOptions: { external },
  },
})
