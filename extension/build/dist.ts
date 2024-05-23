import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import AdmZip from "adm-zip"
import { box } from "./utils"

dotenv.config({ path: ".env.development.local" })

const manifestPath = "dist/manifest.json"
const source = "dist"
const target = "."

function getManifestVersion(path: string) {
  const data = fs.readFileSync(path, "utf8")
  const manifest = JSON.parse(data)
  return manifest.version
}

function createZip(source: string, target: string, version: string) {
  const zip = new AdmZip()
  zip.addLocalFolder(source)
  zip.writeZip(`${target}/${version}.zip`)
  console.log(`Created ${version}.zip`)
}

function clearPreviousVersions(targetDir: string) {
  const absoluteTargetDir = path.resolve(targetDir)
  const files = fs.readdirSync(absoluteTargetDir)
  files.forEach((file) => {
    if (path.extname(file) === ".zip") {
      fs.unlinkSync(path.join(absoluteTargetDir, file))
      console.log(`Deleted ${file}`)
    }
  })
}

function dist() {
  box("dist")
  clearPreviousVersions(target)
  const version = getManifestVersion(manifestPath)
  createZip(source, target, version)
}

dist()
