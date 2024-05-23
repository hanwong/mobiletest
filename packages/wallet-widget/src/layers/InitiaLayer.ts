import { GasPrice } from "@cosmjs/stargate"
import { createHTTPClient, getAPI, getNextPageParams, getRest, type Paginated } from "@initia/utils"
import type { Asset, Chain } from "@initia/initia-registry-types"
import { OmnitiaQueries } from "../shared/queries"

export function toGasPrice(layer: Chain, denom: string) {
  const feeToken = layer.fees?.fee_tokens.find((fee) => fee.denom === denom)
  if (!feeToken) throw new Error("Fee token not found")
  return GasPrice.fromString(feeToken.fixed_min_gas_price + denom)
}

export function getLogo(asset?: Asset): string | undefined {
  return asset?.logo_URIs?.png
}

export function getDecimals(asset?: Asset): number | undefined {
  return asset?.denom_units.find((unit) => unit.denom === asset.symbol)?.exponent
}

export default class InitiaLayer {
  private static instances: Map<string, InitiaLayer> = new Map()

  public pairs: Record<string, string> = {}
  public assets: Asset[] = []

  private constructor(private layer: Chain) {
    this.findAsset = this.findAsset.bind(this)
  }

  private get is_l1(): boolean {
    return !!this.layer.metadata?.is_l1
  }

  public static async initialize(layer: Chain): Promise<InitiaLayer> {
    if (!InitiaLayer.instances.has(layer.chain_id)) {
      const instance = new InitiaLayer(layer)
      await instance.init()
      InitiaLayer.instances.set(layer.chain_id, instance)
    }

    return InitiaLayer.instances.get(layer.chain_id)!
  }

  public static getInstance(chainId: string): InitiaLayer {
    if (!InitiaLayer.instances.has(chainId)) {
      throw new Error(`Instance for chain id "${chainId}" does not exist.`)
    }

    return InitiaLayer.instances.get(chainId)!
  }

  private async init() {
    if (this.is_l1) return

    try {
      await this.fetchPairs()
      await this.fetchAssets()
    } catch (error) {
      //
    }
  }

  private async fetchPairs() {
    try {
      const baseURL = getAPI(this.layer) ?? getRest(this.layer)

      type Pair = { l1: string; l2: string }
      const pairs = await createHTTPClient(baseURL).getAll<Paginated<{ pairs: Pair[] }>, Pair>(
        "/indexer/pair/v1/pairs",
        {},
        getNextPageParams,
        ({ pairs }) => pairs,
      )

      this.pairs = Object.fromEntries(pairs.map(({ l1, l2 }) => [l2, l1]))
    } catch (error) {
      return
    }
  }

  private async fetchAssets() {
    const url = this.layer.metadata?.assetlist
    if (!url) return
    const assetlist = await (await fetch(url)).json()
    this.assets = assetlist.assets
  }

  public findAsset(denom: string): Asset | undefined {
    const asset = this.assets.find((asset) => asset.base === denom)
    if (asset) return asset
    const l1Denom = this.is_l1 ? denom : this.pairs[denom]
    return OmnitiaQueries.getInstance().assets.find((asset) => asset.base === l1Denom)
  }
}
