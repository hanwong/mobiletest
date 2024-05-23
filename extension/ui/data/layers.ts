import { useQuery } from "@tanstack/react-query"
import type { Paginated } from "@initia/utils"
import { createHTTPClient, denomToMetadata, getAPI, getNextPageParams, getRest } from "@initia/utils"
import type { Asset, AssetList, Chain } from "@initia/initia-registry-types"
import type { InitiaTokenInfo } from "./tokens"

export function usePairsQuery(layer: Chain) {
  const baseURL = getAPI(layer) ?? getRest(layer)

  return useQuery({
    queryKey: [baseURL, "pairs"],
    queryFn: async (): Promise<Record<string, string>> => {
      type Pair = { l1: string; l2: string }
      const pairs = await createHTTPClient(baseURL).getAll<Paginated<{ pairs: Pair[] }>, Pair>(
        "/indexer/pair/v1/pairs",
        {},
        getNextPageParams,
        ({ pairs }) => pairs,
      )

      return Object.fromEntries(pairs.map(({ l1, l2 }) => [l2, l1]))
    },
    enabled: !layer.metadata?.is_l1,
  })
}

export function useAssetsQuery(layer: Chain) {
  const url = layer.metadata?.assetlist

  return useQuery({
    queryKey: [url, "assets"],
    queryFn: async () => {
      if (!url) return []
      const { assets } = (await (await fetch(url)).json()) as AssetList
      return assets
    },
    staleTime: Infinity,
  })
}

export function getTokenFromAsset(asset: Asset): InitiaTokenInfo {
  const denom = asset.base
  const symbol = asset.symbol
  const decimals =
    asset.denom_units.find((unit) => unit.denom === asset.display)?.exponent ??
    asset.denom_units.find((unit) => unit.denom === asset.base)?.exponent ??
    asset.denom_units[0]?.exponent ??
    0

  const name = asset.name
  const image = asset.images?.[0].png
  const coingeckoId = asset.coingecko_id
  const metadata = denomToMetadata(denom)

  return { symbol, decimals, name, image, coingeckoId, metadata, denom }
}
