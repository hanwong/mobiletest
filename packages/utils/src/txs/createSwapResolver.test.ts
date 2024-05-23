import { denomToMetadata } from "../initia"
import type { SwapPair } from "./swap"
import createSwapResolver from "./createSwapResolver"

const pairs = new Map<string, SwapPair>([
  [
    "pair1",
    [
      { denom: "SubToken", metadata: denomToMetadata("SubToken"), decimals: 6 },
      { denom: "MainToken", metadata: denomToMetadata("MainToken"), decimals: 6 },
    ],
  ],
  [
    "pair2",
    [
      { denom: "Token1", metadata: denomToMetadata("Token1"), decimals: 6 },
      { denom: "MainToken", metadata: denomToMetadata("MainToken"), decimals: 6 },
    ],
  ],
  [
    "pair3",
    [
      { denom: "Token2", metadata: denomToMetadata("Token2"), decimals: 6 },
      { denom: "MainToken", metadata: denomToMetadata("MainToken"), decimals: 6 },
    ],
  ],
  [
    "pair4",
    [
      { denom: "Token3", metadata: denomToMetadata("Token3"), decimals: 6 },
      { denom: "MainToken", metadata: denomToMetadata("MainToken"), decimals: 6 },
    ],
  ],
  [
    "pair5",
    [
      { denom: "Token4", metadata: denomToMetadata("Token4"), decimals: 6 },
      { denom: "Token5", metadata: denomToMetadata("Token5"), decimals: 6 },
    ],
  ],
  [
    "pair6",
    [
      { denom: "SubToken", metadata: denomToMetadata("SubToken"), decimals: 6 },
      { denom: "Token6", metadata: denomToMetadata("Token6"), decimals: 6 },
    ],
  ],
  [
    "pair7",
    [
      { denom: "SubToken", metadata: denomToMetadata("SubToken"), decimals: 6 },
      { denom: "Token7", metadata: denomToMetadata("Token7"), decimals: 6 },
    ],
  ],
])

const intermediaryDenoms = ["MainToken", "SubToken"]

const resolve = createSwapResolver(pairs, intermediaryDenoms)

describe("createSwapResolver", () => {
  test("send", () => {
    expect(resolve("MainToken", "MainToken")).toEqual({ mode: "send", path: [], lpTokens: [] })
    expect(resolve("Token8", "Token8")).toEqual({ mode: "send", path: [], lpTokens: [] })
  })

  test("direct", () => {
    expect(resolve("Token4", "Token5")).toEqual({
      mode: "direct",
      path: [denomToMetadata("Token4"), denomToMetadata("Token5")],
      lpTokens: ["pair5"],
    })

    expect(resolve("Token5", "Token4")).toEqual({
      mode: "direct",
      path: [denomToMetadata("Token5"), denomToMetadata("Token4")],
      lpTokens: ["pair5"],
    })
  })

  test("route", () => {
    expect(resolve("Token1", "Token2")).toEqual({
      mode: "route",
      path: [denomToMetadata("Token1"), denomToMetadata("MainToken"), denomToMetadata("Token2")],
      lpTokens: ["pair2", "pair3"],
    })

    expect(resolve("Token2", "Token1")).toEqual({
      mode: "route",
      path: [denomToMetadata("Token2"), denomToMetadata("MainToken"), denomToMetadata("Token1")],
      lpTokens: ["pair3", "pair2"],
    })

    expect(resolve("Token6", "Token7")).toEqual({
      mode: "route",
      path: [denomToMetadata("Token6"), denomToMetadata("SubToken"), denomToMetadata("Token7")],
      lpTokens: ["pair6", "pair7"],
    })
  })

  test("unsupported", () => {
    expect(resolve("Token1", "Token7")).toEqual({ mode: "unsupported", path: [], lpTokens: [] })
    expect(resolve("Token8", "Token9")).toEqual({ mode: "unsupported", path: [], lpTokens: [] })
    expect(resolve("Token1", "Token8")).toEqual({ mode: "unsupported", path: [], lpTokens: [] })
  })
})
