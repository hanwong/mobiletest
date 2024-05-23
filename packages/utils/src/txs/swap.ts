import BigNumber from "bignumber.js"
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx"
import { MsgExecute } from "@initia/initia.proto/initia/move/v1/tx"
import { defined, required } from "../common"
import { bcs, denomToMetadata, getIBCDenom } from "../initia"
import { getRest } from "../layer"
import { createInitiaDexClient, createInitiaDexUtilsClient } from "../queries"
import { calcMinimum, calcTimeoutIBC, createHook, getIbcChannels } from "./utils"
import type { Tx } from "./tx"
import createSwapResolver from "./createSwapResolver"

export interface SwapPairItem {
  denom: string
  metadata: string
  decimals: number
}

export type SwapPair = [SwapPairItem, SwapPairItem]

export interface SwapParams {
  offerDenom: string
  askDenom: string
  swaplist: Map<string, SwapPair>
}

export class Swap {
  constructor(
    private tx: Tx,
    private swapParams: SwapParams,
  ) {}

  private get resolve() {
    return createSwapResolver(this.swapParams.swaplist)
  }

  getIsValid({ amount }: { amount: string }) {
    const { getL1Denom } = this.tx
    const { offerDenom, askDenom } = this.swapParams
    if (!BigNumber(amount).gt(0)) return false
    if (!(offerDenom && askDenom)) return false
    const { mode } = this.resolve(getL1Denom(offerDenom), getL1Denom(askDenom))
    if (mode === "unsupported") return false
    // The reason why it doesn't validate slippage tolerance is that
    // if an invalid slippage tolerance is set, it is replaced by the default value.
    return true
  }

  async fetchSwapFeeRate() {
    const { getL1Denom } = this.tx
    const { layer1 } = this.tx.params
    const { offerDenom, askDenom, swaplist } = this.swapParams
    const { mode, lpTokens } = this.resolve(getL1Denom(offerDenom), getL1Denom(askDenom))
    if (mode !== "direct") return null
    const [lpToken] = lpTokens
    const pair = swaplist.get(lpToken)
    if (!pair) return null
    const dex = createInitiaDexClient(getRest(layer1))
    const { swap_fee_rate } = await dex.getConfig(lpToken)
    return swap_fee_rate
  }

  private getDecimals(denom: string) {
    const { getL1Denom } = this.tx
    const { swaplist } = this.swapParams
    const tokens = [...swaplist.values()].flat()
    const token = tokens.find((token) => token.denom === getL1Denom(denom))
    defined(token)
    return token.decimals
  }

  async simulate({ amount }: { amount: string }) {
    if (!this.getIsValid({ amount })) return null

    const { getL1Denom } = this.tx
    const { modules, layer1 } = this.tx.params
    const { offerDenom, askDenom } = this.swapParams

    const dexUtils = createInitiaDexUtilsClient(getRest(layer1), modules.dex_utils)

    const getSimulationResults = async (simulate: (amount: string) => Promise<[string, string]>) => {
      const [returnAmount, priceImpact] = await simulate(amount)

      if (!returnAmount) return null

      const decimals = this.getDecimals(askDenom) - this.getDecimals(offerDenom)
      const expectedPrice = BigNumber(returnAmount).div(amount).times(BigNumber(10).pow(decimals)).toFixed(18)

      return { returnAmount, expectedPrice, priceImpact }
    }

    const { mode, path, lpTokens } = this.resolve(getL1Denom(offerDenom), getL1Denom(askDenom))

    switch (mode) {
      case "direct": {
        const params = dexUtils.getSwapSimulation(path[0], lpTokens[0])
        return await getSimulationResults(params)
      }

      case "route": {
        const params = dexUtils.getRouteSwapSimulation(path[0], lpTokens as [string, string])
        return await getSimulationResults(params)
      }

      default:
        return null
    }
  }

  getMessages({ amount, simulated, slippagePercent }: { amount: string; simulated: string; slippagePercent: string }) {
    const { getL1Denom } = this.tx
    const { modules, layer, address, layer1 } = this.tx.params
    const { offerDenom, askDenom } = this.swapParams

    const { mode, lpTokens } = this.resolve(getL1Denom(offerDenom), getL1Denom(askDenom))
    const minimum = calcMinimum(simulated, slippagePercent)

    if (layer.metadata?.is_l1) {
      if (!address) throw new Error("Address not found")

      switch (mode) {
        case "direct": {
          return [
            {
              typeUrl: "/initia.move.v1.MsgExecute",
              value: MsgExecute.fromPartial({
                sender: address,
                moduleAddress: "0x1",
                moduleName: "dex",
                functionName: "swap_script",
                typeArgs: [],
                args: [
                  bcs.address().serialize(lpTokens[0]).toBytes(),
                  bcs.address().serialize(denomToMetadata(offerDenom)).toBytes(),
                  bcs.u64().serialize(amount).toBytes(),
                  bcs.option(bcs.u64()).serialize(minimum).toBytes(),
                ],
              }),
            },
          ]
        }

        case "route": {
          if (!modules.dex_utils) throw new Error("Utility module not found")
          return [
            {
              typeUrl: "/initia.move.v1.MsgExecute",
              value: MsgExecute.fromPartial({
                sender: address,
                moduleAddress: modules.dex_utils,
                moduleName: "dex_utils",
                functionName: "route_swap",
                typeArgs: [],
                args: [
                  bcs.address().serialize(denomToMetadata(offerDenom)).toBytes(),
                  bcs.vector(bcs.address()).serialize(lpTokens).toBytes(),
                  bcs.u64().serialize(amount).toBytes(),
                  bcs.option(bcs.u64()).serialize(minimum).toBytes(),
                ],
              }),
            },
          ]
        }

        default:
          throw new Error("Invalid swap mode")
      }
    }

    const ibcChannels = getIbcChannels({ layer, layer1 })

    if (!ibcChannels) {
      throw new Error("IBC channels not found")
    }

    const getHook = () => {
      if (layer.metadata?.op_denoms?.includes(getL1Denom(offerDenom))) {
        const offerMetadata = denomToMetadata(getIBCDenom(ibcChannels.fromL1ToL2, offerDenom))
        const returnMetadata = denomToMetadata(getL1Denom(offerDenom))
        return {
          receiver: `${modules.swap_transfer}::swap_transfer::mixed_route_swap_transfer`,
          memo: createHook({
            module_address: modules.swap_transfer,
            module_name: "swap_transfer",
            function_name: "mixed_route_swap_transfer",
            type_args: [],
            args: [
              bcs.address().serialize(offerMetadata).toBase64(),
              bcs
                .vector(bcs.vector(bcs.vector(bcs.u8())))
                .serialize([
                  [
                    Buffer.from(bcs.u8().serialize(1 /* MinitSwap */).toBytes()),
                    Buffer.from(bcs.address().serialize(returnMetadata).toBase64(), "base64"),
                  ],
                  [
                    Buffer.from(bcs.u8().serialize(0 /* Dex */).toBytes()),
                    Buffer.from(bcs.address().serialize(lpTokens[0]).toBytes()),
                  ],
                ])
                .toBase64(),
              bcs.u64().serialize(amount).toBase64(),
              bcs.option(bcs.u64()).serialize(minimum).toBase64(),
              bcs.string().serialize(address).toBase64(),
              bcs.string().serialize("transfer").toBase64(),
              bcs.string().serialize(ibcChannels.fromL1ToL2).toBase64(),
              bcs.string().serialize("").toBase64(),
            ],
          }),
        }
      }

      if (layer.metadata?.op_denoms?.includes(getL1Denom(askDenom))) {
        const offerMetadata = denomToMetadata(getL1Denom(offerDenom))
        return {
          receiver: `${modules.swap_transfer}::swap_transfer::swap_deposit`,
          memo: createHook({
            module_address: modules.swap_transfer,
            module_name: "swap_transfer",
            function_name: "swap_deposit",
            type_args: [],
            args: [
              bcs.address().serialize(lpTokens[0]).toBase64(),
              bcs.address().serialize(offerMetadata).toBase64(),
              bcs.u64().serialize(amount).toBase64(),
              bcs.option(bcs.u64()).serialize(minimum).toBase64(),
              bcs.u64().serialize(required(layer.metadata?.op_bridge_id)).toBase64(),
              bcs.address().serialize(address).toBase64(),
              bcs.vector(bcs.u8()).serialize([]).toBase64(),
            ],
          }),
        }
      }

      if (mode === "direct") {
        const offerMetadata = denomToMetadata(getL1Denom(offerDenom))
        return {
          receiver: `${modules.swap_transfer}::swap_transfer::swap_transfer`,
          memo: createHook({
            module_address: modules.swap_transfer,
            module_name: "swap_transfer",
            function_name: "swap_transfer",
            type_args: [],
            args: [
              bcs.address().serialize(lpTokens[0]).toBase64(),
              bcs.address().serialize(offerMetadata).toBase64(),
              bcs.u64().serialize(amount).toBase64(),
              bcs.option(bcs.u64()).serialize(minimum).toBase64(),
              bcs.string().serialize(address).toBase64(),
              bcs.string().serialize("transfer").toBase64(),
              bcs.string().serialize(ibcChannels.fromL1ToL2).toBase64(),
              bcs.string().serialize("").toBase64(),
            ],
          }),
        }
      }

      if (mode === "route") {
        const offerMetadata = denomToMetadata(getL1Denom(offerDenom))
        return {
          receiver: `${modules.swap_transfer}::swap_transfer::route_swap_transfer`,
          memo: createHook({
            module_address: modules.swap_transfer,
            module_name: "swap_transfer",
            function_name: "route_swap_transfer",
            type_args: [],
            args: [
              bcs.address().serialize(offerMetadata).toBase64(),
              bcs.vector(bcs.address()).serialize(lpTokens).toBase64(),
              bcs.u64().serialize(amount).toBase64(),
              bcs.option(bcs.u64()).serialize(minimum).toBase64(),
              bcs.string().serialize(address).toBase64(),
              bcs.string().serialize("transfer").toBase64(),
              bcs.string().serialize(ibcChannels.fromL1ToL2).toBase64(),
              bcs.string().serialize("").toBase64(),
            ],
          }),
        }
      }

      throw new Error("Unsupported mode")
    }

    const { receiver, memo } = getHook()

    return [
      {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sender: address,
          sourcePort: "transfer",
          sourceChannel: ibcChannels.fromL2ToL1,
          token: { denom: offerDenom, amount },
          timeoutTimestamp: calcTimeoutIBC(10),
          receiver: receiver,
          memo: memo,
        }),
      },
    ]
  }
}
