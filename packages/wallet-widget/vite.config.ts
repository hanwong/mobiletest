import { resolve } from "path"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import dts from "vite-plugin-dts"

const external = [
  // should not be externalized: svelte, @tanstack/svelte-query, @web3auth/*
  new RegExp("^@cosmjs/.*"),
  new RegExp("^@initia/.*"),
  new RegExp("^@ledgerhq/.*"),
  new RegExp("^@walletconnect/.*"),
  new RegExp("^cosmjs-types.*"),
  "@keplr-wallet/types",
  "axios",
  "bignumber.js",
  "date-fns",
  "ethers",
  "ramda",
  "rxjs",
  "zod",
]

export default defineConfig({
  plugins: [svelte({ emitCss: false }), nodePolyfills(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "umd"],
      name: "createWalletWidget",
      fileName: (format) => ({ es: "index.js", umd: "index.min.js" })[format],
    },
    rollupOptions: { external: [] },
  },
})
