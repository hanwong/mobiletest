import { denomToMetadata } from "./metadata"

describe("native", () => {
  const denom = "uinit"
  const metadata = "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9"

  test("denomToMetadata", () => {
    expect(denomToMetadata(denom)).toBe(metadata)
  })
})

describe("custom", () => {
  const denom = "move/76f75544f1867066b0c64cfa71d91463767fb117bfc01cadf7e2fb5cfa204ba7"
  const metadata = "0x76f75544f1867066b0c64cfa71d91463767fb117bfc01cadf7e2fb5cfa204ba7"

  test("denomToMetadata", () => {
    expect(denomToMetadata(denom)).toBe(metadata)
  })
})
