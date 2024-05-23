import { denomToMetadata, required } from "@initia/utils"
import type { Asset } from "@initia/initia-registry-types"
import { useDefinedLayer1 } from "../background"
import { useAssetsQuery } from "./layers"

/* token */
export interface BaseTokenInfo {
  symbol: string
  decimals: number
  name?: string
  image?: string
  coingeckoId?: string
  price?: number
}

export interface CosmosTokenInfo extends BaseTokenInfo {
  denom: string
}

export interface InitiaTokenInfo extends CosmosTokenInfo {
  metadata: string
}

export interface BaseAssetInfo extends BaseTokenInfo {
  balance: string
  value?: number
}

export interface CosmosAssetInfo extends CosmosTokenInfo, BaseAssetInfo {}
export interface InitiaAssetInfo extends InitiaTokenInfo, BaseAssetInfo {}

export function toInitiaTokenInfo(asset: Asset): InitiaTokenInfo {
  return {
    denom: asset.base,
    metadata: denomToMetadata(asset.base),
    decimals: required(asset.denom_units.find((unit) => unit.denom === asset.symbol)?.exponent),
    name: asset.name,
    symbol: asset.symbol,
    image: asset.logo_URIs?.png,
    coingeckoId: asset.coingecko_id,
  }
}

export function useL1AssetsQuery() {
  const layer1 = useDefinedLayer1()
  return useAssetsQuery(layer1)
}

export function useTokens() {
  const { data: assets = [] } = useL1AssetsQuery()
  return new Map(assets.map((asset) => [asset.base, toInitiaTokenInfo(asset)]))
}
