import fs from "fs/promises"
import chalk from "chalk"
import axios from "axios"
import { glob } from "glob"
import semver from "semver"

const PAD_END_VALUE = 28
const PACKAGES_TO_SKIP = ["eslint", "@mantine/*", "@tanstack/*"]

async function getLatestVersion(packageName) {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`)
    return response.data.version
  } catch (error) {
    logError(`Error fetching latest version for ${packageName}: ${error.message}`)
    return null
  }
}

async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content)
}

function shouldSkipPackage(packageName) {
  return PACKAGES_TO_SKIP.some((skipPattern) => {
    return skipPattern.endsWith("*") ? packageName.startsWith(skipPattern.slice(0, -1)) : packageName === skipPattern
  })
}

function logMessage(packageName, currentVersion, latestVersion) {
  if (latestVersion) {
    console.log(
      chalk.blue(packageName.padEnd(PAD_END_VALUE)),
      chalk.green(currentVersion),
      chalk.yellow("=>"),
      chalk.green(latestVersion),
    )
  } else {
    console.log(chalk.blue(packageName.padEnd(PAD_END_VALUE)), chalk.gray("Skipping"))
  }
}

function logError(message) {
  console.error(chalk.red(message))
}

async function updateDependencies(packageJsonPath, dependencies, type) {
  const packageJson = await readJsonFile(packageJsonPath)

  for (const depName in dependencies) {
    if (shouldSkipPackage(depName)) {
      logMessage(depName, dependencies[depName], null)
      continue
    }

    const currentVersion = dependencies[depName]

    if (currentVersion === "workspace:*" || currentVersion === "*") {
      continue
    }

    const latestVersion = await getLatestVersion(depName)

    if (latestVersion && semver.validRange(currentVersion) && semver.validRange(latestVersion)) {
      const newVersion = `^${latestVersion}`

      if (newVersion !== currentVersion) {
        packageJson[type][depName] = newVersion
        logMessage(depName, currentVersion, newVersion)
      }
    } else {
      logError(`Invalid semver for ${depName}, skipping update`)
    }
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n")
}

async function processPackageJson(packageJsonPath) {
  try {
    console.log(chalk.magenta(`\nProcessing ${packageJsonPath}...`))

    const packageJson = await readJsonFile(packageJsonPath)

    if (packageJson.dependencies) {
      console.log(chalk.cyan("\nDependencies:"))
      await updateDependencies(packageJsonPath, packageJson.dependencies, "dependencies")
    }

    if (packageJson.devDependencies) {
      console.log(chalk.cyan("\nDevDependencies:"))
      await updateDependencies(packageJsonPath, packageJson.devDependencies, "devDependencies")
    }

    if (packageJson.peerDependencies) {
      console.log(chalk.cyan("\nPeerDependencies:"))
      await updateDependencies(packageJsonPath, packageJson.peerDependencies, "peerDependencies")
    }
  } catch (error) {
    logError(`Error processing ${packageJsonPath}: ${error.message}`)
  }
}

async function main() {
  const packageJsonFiles = glob.sync("**/package.json", { ignore: "node_modules/**" })

  for (const packageJsonPath of packageJsonFiles) {
    await processPackageJson(packageJsonPath)
  }

  console.log(chalk.green("\nDone!"))
}

main()
