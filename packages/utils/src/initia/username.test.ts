import { isUsernameValid } from "./username"

describe("username", () => {
  test("should return true for valid strings", () => {
    const validString = "example-123.init"
    expect(isUsernameValid(validString)).toBeTruthy()
  })

  test("should return false for strings not ending with .init", () => {
    const invalidString = "example-123.notinit"
    expect(isUsernameValid(invalidString)).toBeFalsy()
  })

  test("should return false for strings with invalid characters", () => {
    const invalidString = "example_123.init"
    expect(isUsernameValid(invalidString)).toBeFalsy()
  })

  test("should return false for strings longer than 64 characters without .init", () => {
    const stringWith65Chars = "a".repeat(65)
    const invalidString = stringWith65Chars + ".init"
    expect(isUsernameValid(invalidString)).toBeFalsy()
  })

  test("should return true for strings with exactly 64 characters without .init", () => {
    const stringWith64Chars = "a".repeat(64)
    const validString = stringWith64Chars + ".init"
    expect(isUsernameValid(validString)).toBeTruthy()
  })
})
