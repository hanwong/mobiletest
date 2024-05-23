import fs from "fs"

const revert = process.argv.includes("--revert")

const path = "./package.json"
const json = JSON.parse(fs.readFileSync(path, "utf8"))

if (!revert) {
  json.module = "dist/index.js"
} else {
  json.module = "index.ts"
}

fs.writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8")
