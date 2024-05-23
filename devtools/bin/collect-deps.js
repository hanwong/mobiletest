import fs from "fs"
import { glob } from "glob"
import ts from "typescript"
import chalk from "chalk"

const sourceFolder = "src"
const outputFilename = "external.json"
const skipDependencies = new Set(["react", "@tanstack/react-query", "@mantine/core"])

function collectDependencies(sourceFolder) {
  const files = glob.sync(`${sourceFolder}/**/*.{ts,tsx}`)
  const dependencies = new Set()

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf8")
    const sourceFile = ts.createSourceFile(file, fileContent, ts.ScriptTarget.ESNext, true)

    ts.forEachChild(sourceFile, function collectImports(node) {
      if (ts.isImportDeclaration(node)) {
        const moduleName = node.moduleSpecifier.getText(sourceFile).replace(/['"`]/g, "")
        if (!moduleName.startsWith(".")) dependencies.add(moduleName)
      }

      ts.forEachChild(node, collectImports)
    })
  }

  return dependencies
}

function saveDependenciesListToFile(dependencies, outputFilename) {
  const content = JSON.stringify(Array.from(dependencies).sort(), null, 2)
  fs.writeFileSync(outputFilename, content, "utf8")
}

function extractBasePackageName(moduleName) {
  if (moduleName.startsWith("@")) {
    const parts = moduleName.split("/")
    return parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0]
  }
  return moduleName.split("/")[0]
}

function checkDependenciesAgainstDependencies(importedDependencies) {
  const packageJsonPath = "./package.json"
  if (!fs.existsSync(packageJsonPath)) {
    console.error("package.json not found.")
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
  const name = packageJson.name || ""
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  }

  console.log(name)

  importedDependencies.forEach((fullDependency) => {
    if (skipDependencies.has(fullDependency)) {
      console.log(chalk.yellow(`Skipping '${fullDependency}'`))
      return
    }

    const baseDependency = extractBasePackageName(fullDependency)
    if (!allDependencies.hasOwnProperty(baseDependency)) {
      console.log(chalk.red(`Dependency '${baseDependency}' is not listed in dependencies.`))
    } else {
      console.log(chalk.green(`Dependency '${baseDependency}' is correctly listed in dependencies.`))
    }
  })

  // Check for dependencies in package.json that are not used in the code
  Object.keys(allDependencies).forEach((dep) => {
    if (!new Set([...importedDependencies].map(extractBasePackageName)).has(dep) && !skipDependencies.has(dep)) {
      console.log(chalk.blue(`Dependency '${dep}' is listed in package.json but not used in the code.`))
    }
  })
}

const importedDependencies = collectDependencies(sourceFolder)
saveDependenciesListToFile(importedDependencies, outputFilename)
checkDependenciesAgainstDependencies(importedDependencies)
console.log(`Dependencies list written to ${outputFilename}\n`)
