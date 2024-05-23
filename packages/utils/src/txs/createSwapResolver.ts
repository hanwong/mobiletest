import { denomToMetadata } from "../initia"
import type { SwapPair } from "./swap"

export default function createSwapResolver(swapPair: Map<string, SwapPair>, intermediaryDenoms = ["uinit"]) {
  function findPair(offerDenom: string, askDenom: string) {
    if (offerDenom === askDenom) return
    return [...swapPair.entries()].find(
      ([, pair]) => pair.some(({ denom }) => denom === offerDenom) && pair.some(({ denom }) => denom === askDenom),
    )
  }

  function findRoute(offerDenom: string, askDenom: string) {
    if (offerDenom === askDenom) return

    for (const intermediaryDenom of intermediaryDenoms) {
      const pair1 = findPair(offerDenom, intermediaryDenom)
      const pair2 = findPair(askDenom, intermediaryDenom)
      if (pair1 && pair2)
        return { path: [offerDenom, intermediaryDenom, askDenom].map(denomToMetadata), lpTokens: [pair1[0], pair2[0]] }
    }
  }

  return function (offerDenom: string, askDenom: string) {
    if (offerDenom === askDenom) return { mode: "send" as const, path: [], lpTokens: [] }

    const pair = findPair(offerDenom, askDenom)
    if (pair) return { mode: "direct" as const, path: [offerDenom, askDenom].map(denomToMetadata), lpTokens: [pair[0]] }

    const route = findRoute(offerDenom, askDenom)
    if (route) return { mode: "route" as const, ...route }

    return { mode: "unsupported" as const, path: [], lpTokens: [] }
  }
}
