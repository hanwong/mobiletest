import { resolve } from "path"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import dts from "vite-plugin-dts"

const external = [
  new RegExp("^@cosmjs/.*"),
  new RegExp("^@initia/.*"),
  new RegExp("^@noble/hashes.*"),
  new RegExp("^cosmjs-types.*"),
  "@msgpack/msgpack",
  "@mysten/bcs",
  "axios",
  "bech32",
  "bignumber.js",
  "change-case",
  "ethers",
  "long",
  "numeral",
  "ramda",
  "zod",
]

export default defineConfig({
  plugins: [nodePolyfills(), dts()],
  build: {
    lib: { entry: resolve(__dirname, "src/index.ts"), fileName: "index", formats: ["es"] },
    rollupOptions: { external },
  },
})
