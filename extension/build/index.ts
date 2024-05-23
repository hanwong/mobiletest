import path from "path"
import { fileURLToPath } from "url"
import { mergeConfig, build } from "vite"
import * as root from "../vite.config.root"
import { box } from "./utils"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const watch = process.argv.includes("--watch")
const scriptsOnly = process.argv.includes("--scripts")

const entries = {
  background: "scripts/background.ts",
  content: "scripts/content.ts",
  page: "scripts/page.ts",
}

async function main() {
  const base = mergeConfig(root.base, {
    resolve: {
      alias: {
        "@protobufjs/inquire": path.resolve(__dirname, "patches/inquire.js"),
        "libsodium-wrappers": path.resolve(__dirname, "patches/libsodium.js"),
      },
    },
    build: { watch: watch ? {} : null, outDir: "dist", emptyOutDir: !watch, minify: false },
    configFile: false,
  })

  const buildScript = async (name: string, entry: string) => {
    const filename = `${name}.js`
    const lib = { name, entry, formats: ["iife"], fileName: () => filename }

    box(filename)
    await build(mergeConfig(base, { build: { lib, emptyOutDir: false } }))
  }

  if (!scriptsOnly) {
    box("React")
    await build(mergeConfig(base, root.app))
  }

  for (const [name, entry] of Object.entries(entries)) {
    await buildScript(name, entry)
  }
}

main()
