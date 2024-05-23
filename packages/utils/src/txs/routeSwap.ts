import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx"
import type { Chain } from "@initia/initia-registry-types"
import { required } from "../common"
import { bcs, denomToMetadata, getIBCDenom } from "../initia"
import { getRest } from "../layer"
import { createInitiaMoveClient } from "../queries"
import { calcTimeoutIBC, getIbcChannels } from "./utils"
import { getL1Denom, type Tx } from "./tx"
import type { SwapParams } from "./swap"
import createSwapResolver from "./createSwapResolver"
import { MsgExecute } from "@initia/initia.proto/initia/move/v1/tx"

export interface RouteSwapParams extends SwapParams {
  targetLayer: Chain
  targetLayerPairs?: Record<string, string>
}

export class RouteSwap {
  constructor(
    private tx: Tx,
    private routeSwapParams: RouteSwapParams,
  ) {}

  async simulate({ amount }: { amount: string }) {
    const { layer1, modules } = this.tx.params

    // use getMixedRouteSwapMsg instead of getRoutes to check bridge validation
    const mixedRouteSwapMsg = this.getMixedRouteSwapMsg({ amount, recipientAddress: "0x1" })

    const client = createInitiaMoveClient(getRest(layer1))

    return client.view<string>({
      moduleAddress: modules.swap_transfer,
      moduleName: "swap_transfer",
      functionName: "mixed_route_swap_simulation",
      type_args: [],
      args: mixedRouteSwapMsg.value.args.slice(0, 3).map((byteArg) => Buffer.from(byteArg).toString("base64")),
    })
  }

  getMessages(params: { amount: string; recipientAddress: string; minimum?: string }) {
    const { address, layer: sourceLayer, layer1 } = this.tx.params
    const { offerDenom, askDenom, targetLayer } = this.routeSwapParams
    const { amount, recipientAddress } = params
    // case1. send
    if (offerDenom === askDenom && sourceLayer.chain_id === targetLayer.chain_id) {
      return [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: MsgSend.fromPartial({
            fromAddress: address,
            toAddress: recipientAddress,
            amount: [{ denom: offerDenom, amount }],
          }),
        },
      ]
    }

    // generate mixed route swap msg
    const routeSwapMsg = this.getMixedRouteSwapMsg(params)

    // if source is l1, return route swap msg
    if (layer1.chain_id === sourceLayer.chain_id) {
      return [routeSwapMsg]
    }

    const ibcChannels = getIbcChannels({ layer: sourceLayer, layer1 })

    if (!ibcChannels) {
      throw new Error("IBC channels not found")
    }

    const { receiver, memo } = this.executeMsgToIbcHook(routeSwapMsg.value)

    return [
      {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sender: address,
          sourcePort: "transfer",
          sourceChannel: ibcChannels.fromL2ToL1,
          token: { denom: offerDenom, amount },
          timeoutTimestamp: calcTimeoutIBC(10),
          receiver,
          memo,
        }),
      },
    ]
  }

  executeMsgToIbcHook(executeMsg: MsgExecute) {
    const hook = {
      move: {
        message: {
          module_address: executeMsg.moduleAddress,
          module_name: executeMsg.moduleName,
          function_name: executeMsg.functionName,
          type_args: [],
          args: executeMsg.args.map((byteArg) => Buffer.from(byteArg).toString("base64")),
        },
      },
    }

    const receiver = `${executeMsg.moduleAddress}::${executeMsg.moduleName}::${executeMsg.functionName}`

    return {
      receiver,
      memo: JSON.stringify(hook),
    }
  }

  getRoutes() {
    const { offerDenom, askDenom, targetLayer, targetLayerPairs } = this.routeSwapParams
    const { layer: sourceLayer, layer1 } = this.tx.params
    const { getL1Denom: getL1DenomSource } = this.tx
    const getL1DenomTarget = (l2Denom: string) =>
      getL1Denom({ l2Denom, layer1, layer2: targetLayer, pairs: targetLayerPairs })
    const resolver = createSwapResolver(this.routeSwapParams.swaplist)
    const swapRoutes = resolver(getL1DenomSource(offerDenom), getL1DenomTarget(askDenom))

    if (swapRoutes.mode === "unsupported") {
      throw new Error("Unsupported path")
    }

    let routeArgs = [
      ...swapRoutes.lpTokens.map((lpToken) => [
        bcs.u8().serialize(0).toBytes(),
        bcs.object().serialize(lpToken).toBytes(),
      ]),
    ]
    let offerMetadata = denomToMetadata(getL1DenomSource(offerDenom))

    // if op bridged token add minitswap route
    if (offerDenom.startsWith("l2/") && offerDenom !== askDenom) {
      routeArgs = [[bcs.u8().serialize(1).toBytes(), bcs.object().serialize(offerMetadata).toBytes()], ...routeArgs]
      const ibcChannels = getIbcChannels({ layer: sourceLayer, layer1 })

      if (!ibcChannels) {
        throw new Error("IBC channels not found")
      }
      offerMetadata = denomToMetadata(getIBCDenom(ibcChannels.fromL1ToL2, offerDenom))
    }

    return {
      offerMetadata,
      routeArgs,
    }
  }

  getMixedRouteSwapMsg(params: { amount: string; recipientAddress: string; minimum?: string }) {
    const getL1DenomTarget = (l2Denom: string) =>
      getL1Denom({
        l2Denom,
        layer1,
        layer2: this.routeSwapParams.targetLayer,
        pairs: this.routeSwapParams.targetLayerPairs,
      })

    const { address, layer1, modules } = this.tx.params
    const { askDenom, targetLayer } = this.routeSwapParams
    const { amount, recipientAddress, minimum } = params

    const { offerMetadata, routeArgs } = this.getRoutes()

    const msg = {
      typeUrl: "/initia.move.v1.MsgExecute",
      value: MsgExecute.fromPartial({
        sender: address,
        moduleAddress: modules.swap_transfer,
        moduleName: "swap_transfer",
        functionName: "",
        typeArgs: [],
        args: [
          bcs.address().serialize(offerMetadata).toBytes(),
          bcs
            .vector(bcs.vector(bcs.vector(bcs.u8())))
            .serialize(routeArgs)
            .toBytes(),
          bcs.u64().serialize(amount).toBytes(),
          bcs.option(bcs.u64()).serialize(minimum).toBytes(),
        ],
      }),
    }

    // swap send
    if (targetLayer.chain_id === layer1.chain_id) {
      msg.value.functionName = "mixed_route_swap_to"
      msg.value.args = [...msg.value.args, bcs.address().serialize(recipientAddress).toBytes()]
      // swap op deposit
    } else if (targetLayer.metadata?.op_denoms?.includes(getL1DenomTarget(askDenom))) {
      msg.value.functionName = "mixed_route_swap_deposit"
      msg.value.args = [
        ...msg.value.args,
        bcs.u64().serialize(required(targetLayer.metadata?.op_bridge_id)).toBytes(),
        bcs.address().serialize(recipientAddress).toBytes(),
        bcs.vector(bcs.u8()).serialize([]).toBytes(),
      ]
      // swap ibc transfer
    } else {
      const ibcChannels = getIbcChannels({ layer: targetLayer, layer1 })

      if (!ibcChannels) {
        throw new Error("IBC channels not found")
      }

      msg.value.functionName = "mixed_route_swap_transfer"
      msg.value.args = [
        ...msg.value.args,
        bcs.string().serialize(recipientAddress).toBytes(),
        bcs.string().serialize("transfer").toBytes(),
        bcs.string().serialize(ibcChannels.fromL1ToL2).toBytes(),
        bcs.string().serialize("").toBytes(),
      ]
    }
    return msg
  }
}
