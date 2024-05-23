import boxen from "boxen"

export function box(message: string, borderColor = "blue") {
  console.log(boxen(message, { borderColor, padding: { top: 0, bottom: 0, left: 1, right: 1 } }))
}
