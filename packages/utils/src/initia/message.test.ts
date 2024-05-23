import { stringifyMessageValue } from "./message"

describe("stringifyMessageValue", () => {
  it("should convert string to string", () => {
    expect(stringifyMessageValue("test")).toBe("test")
  })

  it("should convert number to string", () => {
    expect(stringifyMessageValue(123)).toBe("123")
  })

  it("should convert boolean to string", () => {
    expect(stringifyMessageValue(true)).toBe("true")
  })

  it("should convert Uint8Array to base64 string", () => {
    const input = new Uint8Array([72, 101, 108, 108, 111])
    expect(stringifyMessageValue(input)).toBe("SGVsbG8=")
  })

  it("should convert array of Uint8Arrays to array of base64 strings", () => {
    const input = [new Uint8Array([72, 101, 108, 108, 111]), new Uint8Array([87, 111, 114, 108, 100])]
    const expectedOutput = '["SGVsbG8=","V29ybGQ="]'
    expect(stringifyMessageValue(input)).toBe(expectedOutput)
  })

  it("should convert object to JSON string", () => {
    expect(stringifyMessageValue([{ key: "value" }])).toBe('[{"key":"value"}]')
  })
})
