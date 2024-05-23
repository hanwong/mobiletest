import Data from "./data"

describe("Data Tests", () => {
  it("should handle Buffer input", () => {
    const buffer = Buffer.from("Hello, world!", "utf8")
    const handler = new Data(buffer)
    expect(handler.buffer).toEqual(buffer)
    expect(handler.utf8).toBe("Hello, world!")
  })

  it("should handle string input", () => {
    const handler = new Data("Hello, world!")
    expect(handler.buffer).toEqual(Buffer.from("Hello, world!", "utf8"))
    expect(handler.utf8).toBe("Hello, world!")
  })

  it("should handle hexadecimal string input", () => {
    const hexString = "48656c6c6f2c20776f726c6421" // "Hello, world!" in hex
    const handler = new Data(hexString)
    expect(handler.hex).toBe(hexString)
  })

  it("should handle base64 string input", () => {
    const base64String = "SGVsbG8sIHdvcmxkIQ==" // "Hello, world!" in base64
    const handler = new Data(base64String)
    expect(handler.base64).toBe(base64String)
  })

  it("should handle Uint8Array input", () => {
    const uint8Array = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33])
    const handler = new Data(uint8Array)
    expect(handler.buffer).toEqual(Buffer.from(uint8Array))
    expect(handler.utf8).toBe("Hello, world!")
  })
})
