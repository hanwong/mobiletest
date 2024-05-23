import BigNumber from "bignumber.js"
import type { Chain } from "@initia/initia-registry-types"
import { required } from "../common"
import { getIBCDenom, getOpDenom } from "../initia"
import { findTransferChannelId } from "../layer"
import { validateSlippage } from "./validate"

export function createHook(params: object) {
  const hook = { move: { message: params } }
  return JSON.stringify(hook)
}

export function calcTimeoutIBC(offsetMinutes: number): bigint {
  return BigNumber(Date.now())
    .plus(offsetMinutes * 60 * 1000)
    .times(1000000)
    .toString() as unknown as bigint
}

export function calcMinimum(simulated: string, slippagePercent: string) {
  const n = validateSlippage(slippagePercent).type === "error" ? DEFAULT_SLIPPAGE_PERCENT : slippagePercent
  return BigNumber(simulated).times(BigNumber(100).minus(n)).div(100).toFixed(0)
}

export function getIbcChannels({ layer, layer1 }: { layer: Chain; layer1: Chain }) {
  if (layer1.chain_id === layer.chain_id) return
  const fromL1ToL2 = findTransferChannelId(layer1, layer)
  const fromL2ToL1 = findTransferChannelId(layer, layer1)
  if (!(fromL1ToL2 && fromL2ToL1)) return
  return { fromL1ToL2, fromL2ToL1 }
}

export function getSwappableDenoms({
  layer,
  layer1,
  swappableL1,
}: {
  layer: Chain
  layer1: Chain
  swappableL1: string[]
}) {
  if (layer.metadata?.is_l1) {
    return swappableL1
  }

  const ibcChannels = getIbcChannels({ layer, layer1 })

  if (ibcChannels) {
    return swappableL1.map((denom) => {
      if (!layer.metadata?.op_denoms?.includes(denom)) return getIBCDenom(ibcChannels.fromL2ToL1, denom)
      return getOpDenom(BigInt(required(layer.metadata?.op_bridge_id)), denom)
    })
  }

  return []
}

export const DEFAULT_SLIPPAGE_PERCENT = 0.5
