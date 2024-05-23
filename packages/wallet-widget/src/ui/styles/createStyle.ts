interface Params {
  gap?: number
  p?: number
  px?: number
  py?: number
  m?: number
  mx?: number
  my?: number
}

function toCssProperty(key: string, value: number) {
  const directions: { [key: string]: string[] } = {
    gap: ["gap"],
    p: ["padding"],
    px: ["padding-left", "padding-right"],
    py: ["padding-top", "padding-bottom"],
    m: ["margin"],
    mx: ["margin-left", "margin-right"],
    my: ["margin-top", "margin-bottom"],
  }

  const properties = directions[key]

  if (!properties) {
    return []
  }

  return properties.map((property) => `${property}: ${value}px;`)
}

export default function createStyle(params: Params) {
  const style = []

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      style.push(...toCssProperty(key, value))
    }
  }

  return style.join(" ")
}
