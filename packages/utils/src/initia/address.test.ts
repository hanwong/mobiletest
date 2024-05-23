import { AddressUtils } from "./address"

describe("AddressUtils Tests", () => {
  describe("Standard hex and bech32 address conversion tests", () => {
    const hexAddress = "0x77d96ae5e7885b19b5bf4e680e129ace8fd58fb1"
    const bech32Address = "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs"

    test("should convert hex to bech32 format correctly", () => {
      expect(AddressUtils.toBech32(hexAddress)).toBe(bech32Address)
    })

    test("should convert bech32 to hex format correctly", () => {
      expect(AddressUtils.toPrefixedHex(bech32Address)).toBe(hexAddress)
    })

    test("should recognize hex and bech32 as equal", () => {
      expect(AddressUtils.isEqual(hexAddress, bech32Address)).toBe(true)
    })
  })

  describe("Edge case hex and bech32 conversion tests for short address", () => {
    const hexAddress = "0x1"
    const bech32Address = "init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d"

    test("should correctly convert short hex address to bech32 format", () => {
      expect(AddressUtils.toBech32(hexAddress)).toBe(bech32Address)
    })

    test("should correctly convert bech32 address to short hex format", () => {
      expect(AddressUtils.toPrefixedHex(bech32Address)).toBe(hexAddress)
    })

    test("should recognize short hex and bech32 as equal", () => {
      expect(AddressUtils.isEqual(hexAddress, bech32Address)).toBe(true)
    })
  })

  describe("Error handling tests for empty string inputs", () => {
    test("should return empty string for empty string in toHex", () => {
      expect(AddressUtils.toHex("")).toBe("")
    })

    test("should return empty string for empty string in toPrefixedHex", () => {
      expect(AddressUtils.toPrefixedHex("")).toBe("")
    })

    test("should return empty string for empty string in toBech32", () => {
      expect(AddressUtils.toBech32("")).toBe("")
    })
  })

  describe("Error handling tests for isEqual function", () => {
    test("should return false for empty string and valid address", () => {
      expect(AddressUtils.isEqual("", "0x77d96ae5e7885b19b5bf4e680e129ace8fd58fb1")).toBe(false)
    })

    test("should return false for valid address and empty string", () => {
      expect(AddressUtils.isEqual("0x77d96ae5e7885b19b5bf4e680e129ace8fd58fb1", "")).toBe(false)
    })

    test("should return false for invalid and valid address", () => {
      expect(AddressUtils.isEqual("invalidAddress", "0x77d96ae5e7885b19b5bf4e680e129ace8fd58fb1")).toBe(false)
    })

    test("should return false for valid address and invalid address", () => {
      expect(AddressUtils.isEqual("0x77d96ae5e7885b19b5bf4e680e129ace8fd58fb1", "invalidAddress")).toBe(false)
    })
  })
})
