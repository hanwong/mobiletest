import { path } from "ramda"
import type { Chain } from "@initia/initia-registry-types"
import { required } from "../common"
import { getIBCDenom, getOpDenom } from "../initia"
import { type SendParams, Send } from "./send"
import { type SendNFTParams, SendNFT } from "./sendNFT"
import { type SwapParams, Swap } from "./swap"
import { type RouteSwapParams, RouteSwap } from "./routeSwap"

export interface TxParams {
  address: string
  layer1: Chain
  layer: Chain
  modules: {
    dex_utils: string
    swap_transfer: string
  }
  pairs?: Record<string, string>
}

export class Tx {
  params: TxParams

  constructor(params: TxParams) {
    this.params = params
    this.getL1Denom = this.getL1Denom.bind(this)
  }

  getL1Denom(l2Denom: string, layer: Chain = this.params.layer) {
    return getL1Denom({ l2Denom, layer1: this.params.layer1, layer2: layer, pairs: this.params.pairs })
  }

  send(sendParams: SendParams) {
    return new Send(this, sendParams)
  }

  sendNFT(sendNFTParams: SendNFTParams) {
    return new SendNFT(this, sendNFTParams)
  }

  swap(swapParams: SwapParams) {
    return new Swap(this, swapParams)
  }

  routeSwap(routeSwapParams: RouteSwapParams) {
    return new RouteSwap(this, routeSwapParams)
  }
}

export function getL1Denom({
  l2Denom,
  layer1,
  layer2,
  pairs,
}: {
  l2Denom: string
  layer1: Chain
  layer2: Chain
  pairs?: Record<string, string>
}) {
  if (layer2.metadata?.is_l1) {
    return l2Denom
  }

  if (pairs && pairs[l2Denom]) {
    return pairs[l2Denom]
  }

  const ibcChannel = layer1.metadata?.ibc_channels?.find(
    ({ chain_id, version }) => chain_id === layer2.chain_id && version === "ics20-1",
  )

  if (ibcChannel) {
    return getIBCDenom(ibcChannel.channel_id, l2Denom)
  }

  throw new Error(`Cannot find layer 1 denom for ${l2Denom}`)
}

export function getL2Denom({
  l1Denom,
  layer1,
  layer2,
  pairs,
}: {
  l1Denom: string
  layer1: Chain
  layer2: Chain
  pairs?: Record<string, string>
}) {
  if (layer2.metadata?.is_l1) {
    return l1Denom
  }

  const tokenFromPair = pairs ? Object.keys(pairs).find((key) => pairs[key] === l1Denom) : undefined

  if (tokenFromPair) {
    return tokenFromPair
  }

  if (layer2.metadata?.op_bridge_id && layer2.metadata.op_denoms?.includes(l1Denom)) {
    return getOpDenom(BigInt(layer2.metadata.op_bridge_id), l1Denom)
  }

  const ibcChannel = layer1.metadata?.ibc_channels?.find(
    ({ chain_id, version }) => chain_id === layer2.chain_id && version === "ics20-1",
  )

  if (ibcChannel) {
    return getIBCDenom(ibcChannel.channel_id, l1Denom)
  }

  throw new Error(`Cannot find layer 2 denom for ${l1Denom}`)
}

export function getGasPrice(feeDenom: string, layer: Chain, gasPrices: Record<string, string>) {
  const feeToken = required(
    layer?.fees?.fee_tokens.find((item) => item.denom === feeDenom),
    `${feeDenom} not found`,
  )

  const { fixed_min_gas_price } = feeToken
  const gasPrice = Number(path(["feeDenom"], gasPrices))

  if (fixed_min_gas_price && Number.isFinite(fixed_min_gas_price)) return fixed_min_gas_price
  if (layer.metadata?.is_l1 && Number.isFinite(gasPrice)) return gasPrice
  return 0
}
