import bcs from "./bcs"

describe("BCS Serialization Tests", () => {
  test("Address Serialization", () => {
    const serialized = bcs.address().serialize("init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d").toBase64()
    expect(serialized).toEqual("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE=")
  })

  test("Address Serialization", () => {
    const serialized = bcs.address().serialize("0x1").toBase64()
    expect(serialized).toEqual("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE=")
  })

  test("String Serialization", () => {
    const serialized = bcs.string().serialize("Hello, world!").toBase64()
    expect(serialized).toEqual("DUhlbGxvLCB3b3JsZCE=")
  })

  test("u64 Serialization", () => {
    const serialized = bcs.u64().serialize(123).toBase64()
    expect(serialized).toEqual("ewAAAAAAAAA=")
  })

  test("u8 Serialization", () => {
    const serialized = bcs.u8().serialize(123).toBase64()
    expect(serialized).toEqual("ew==")
  })

  test("Vector of Address Serialization", () => {
    const serialized = bcs.vector(bcs.address()).serialize(["init1gs9eytt8lauv6c83jsk7eakhxv30gftlskqz3d"]).toBase64()
    expect(serialized).toEqual("AQAAAAAAAAAAAAAAAEQLki1n/3jNYPGULez21zMi9CV/")
  })

  test("Option of u8 Serialization", () => {
    const serialized = bcs.option(bcs.u8()).serialize(123).toBase64()
    expect(serialized).toEqual("AXs=")
  })

  test("fixedPoint32 Serialization", () => {
    const serialized = bcs.fixedPoint32().serialize("1.23").toBase64()
    expect(serialized).toEqual("rkfhOgEAAAA=")
  })

  test("fixedPoint64 Serialization", () => {
    const serialized = bcs.fixedPoint64().serialize("123456789.987654321").toBase64()
    expect(serialized).toEqual("4MO1cuDp1vwVzVsHAAAAAA==")
  })

  test("decimal128 Serialization", () => {
    const serialized = bcs.decimal128().serialize("0.000000000000000001").toBase64()
    expect(serialized).toEqual("AQAAAAAAAAAAAAAAAAAAAA==")
  })

  test("decimal256 Serialization", () => {
    const serialized = bcs.decimal256().serialize("1000000000000000000").toBase64()
    expect(serialized).toEqual("AAAAABCfS7MVB8l7zpfAAAAAAAAAAAAAAAAAAAAAAAA=")
  })
})
