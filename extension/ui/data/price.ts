import { useCallback } from "react"
import BigNumber from "bignumber.js"
import { useQuery } from "@tanstack/react-query"
import { createInitiaDexClient } from "@initia/utils"
import { defaultChain } from "../../scripts/shared/chains"
import { useTokens } from "./tokens"
import { useSwaplist } from "./swap"

/* find lp token from tokens */
export function useFindLpToken() {
  const pairs = useSwaplist()

  return useCallback(
    (offerDenom: string, askDenom: string) =>
      [...pairs.entries()].find(
        ([, [a, b]]) =>
          (a.denom === offerDenom && b.denom === askDenom) || (a.denom === askDenom && b.denom === offerDenom),
      )?.[0],
    [pairs],
  )
}

export function useFindDefinedLpToken() {
  const findLpToken = useFindLpToken()
  return useCallback(
    (offerDenom: string, askDenom: string) => {
      const lpTokenMetadata = findLpToken(offerDenom, askDenom)
      if (!lpTokenMetadata) throw new Error(`No LP token found for ${offerDenom} and ${askDenom}`)
      return lpTokenMetadata
    },
    [findLpToken],
  )
}

/* hooks */
function useDexClient() {
  const chain = defaultChain
  return createInitiaDexClient(chain.rest)
}

export function useSpotPrice(offerMetadata: string, askMetadata: string) {
  const client = useDexClient()
  const findLpToken = useFindLpToken()
  const lpTokenMetadata = findLpToken(offerMetadata, askMetadata)

  return useQuery({
    queryKey: [client.rest, [offerMetadata, askMetadata, lpTokenMetadata], "SpotPrice"],
    queryFn: () => {
      if (!lpTokenMetadata) return null
      return client.getSpotPrice(offerMetadata, lpTokenMetadata)
    },
  })
}

export const useSpotPriceBasedINIT = (askDenom: string) => {
  const offerDenom = "uinit"
  const client = useDexClient()
  const findLpToken = useFindLpToken()
  const tokens = useTokens()
  const lpTokenMetadata = findLpToken(offerDenom, askDenom)

  return useQuery({
    queryKey: [client.rest, [offerDenom, askDenom, lpTokenMetadata], "SpotPrice"],
    queryFn: () => {
      const offerMetadata = tokens.get(offerDenom)?.metadata
      const askMetadata = tokens.get(askDenom)?.metadata

      if (askDenom === "uinit") return "1"
      if (!lpTokenMetadata || !offerMetadata || !askMetadata) return null

      return client.getSpotPrice(offerMetadata, lpTokenMetadata)
    },
  })
}

export function useRelativePrice(offerDenom: string, askDenom: string) {
  const { data: offerPrice } = useSpotPriceBasedINIT(offerDenom)
  const { data: askPrice } = useSpotPriceBasedINIT(askDenom)
  return askPrice && offerPrice ? BigNumber(askPrice).div(offerPrice).toString() : undefined
}
