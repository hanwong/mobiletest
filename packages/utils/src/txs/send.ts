import BigNumber from "bignumber.js"
import { sha256 } from "@noble/hashes/sha256"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx"
import { MsgInitiateTokenDeposit } from "@initia/opinit.proto/opinit/ophost/v1/tx"
import type { Chain } from "@initia/initia-registry-types"
import { required } from "../common"
import { AddressUtils, bcs, denomToMetadata, getIBCDenom } from "../initia"
import { findTransferChannelId, getRest } from "../layer"
import { createInitiaMoveClient } from "../queries"
import { calcTimeoutIBC, createHook } from "./utils"
import { Tx } from "./tx"

export interface SendParams {
  denom: string
  targetLayer: Chain
}

export class Send {
  constructor(
    private tx: Tx,
    private sendParams: SendParams,
  ) {}

  private isMsgTransfer(value: unknown): value is MsgTransfer {
    return (value as MsgTransfer).receiver !== undefined
  }

  getSimulationParams({ amount }: { amount: string }) {
    const [{ value }] = this.getMessages({ amount, recipientAddress: this.tx.params.address })
    if (!this.isMsgTransfer(value)) return null

    const { receiver } = value
    const { layer1, modules } = this.tx.params

    if (receiver.startsWith(`${modules.swap_transfer}::swap_transfer::minit_swap_to`)) {
      return this.sendParams
    }

    if (receiver.startsWith(`${modules.swap_transfer}::swap_transfer::minit_swap_deposit`)) {
      return { ...this.sendParams, targetLayer: layer1 }
    }

    return null
  }

  async simulate({ amount }: { amount: string }) {
    const simulationParams = this.getSimulationParams({ amount })
    if (!simulationParams) return null

    const { getL1Denom } = this.tx
    const { layer: sourceLayer, layer1, modules } = this.tx.params
    const { denom, targetLayer } = simulationParams

    const client = createInitiaMoveClient(getRest(layer1))

    if (!BigNumber(amount).gt(0)) return null
    if (!(sourceLayer && targetLayer)) return null

    const ibcChannelReversed = findTransferChannelId(targetLayer, sourceLayer)
    if (!ibcChannelReversed) throw new Error("IBC channel not found")

    const offerMetadata = denomToMetadata(getIBCDenom(ibcChannelReversed, denom))
    const returnMetadata = denomToMetadata(getL1Denom(denom, sourceLayer))

    return client.view<[string, string]>({
      moduleAddress: modules.swap_transfer,
      moduleName: "minit_swap",
      functionName: "swap_simulation",
      type_args: [],
      args: [
        bcs.address().serialize(offerMetadata).toBase64(),
        bcs.address().serialize(returnMetadata).toBase64(),
        bcs.u64().serialize(amount).toBase64(),
      ],
    })
  }

  getMessages(params: { amount: string; recipientAddress: string; minimum?: string }) {
    const { getL1Denom } = this.tx
    const { address, layer1, modules, layer: sourceLayer } = this.tx.params
    const { denom, targetLayer } = this.sendParams
    const { amount, recipientAddress, minimum } = params

    const ibcChannelFromSourceToTarget = findTransferChannelId(sourceLayer, targetLayer)
    const ibcChannelFromSourceToL1 = findTransferChannelId(sourceLayer, layer1)
    const ibcChannelFromTargetToSource = findTransferChannelId(targetLayer, sourceLayer)
    const ibcChannelFromL1ToSource = findTransferChannelId(layer1, sourceLayer)
    const ibcChannelFromL1ToTarget = findTransferChannelId(layer1, targetLayer)

    if (sourceLayer.chain_id === targetLayer.chain_id) {
      return [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: MsgSend.fromPartial({
            fromAddress: address,
            toAddress: recipientAddress,
            amount: [{ denom, amount }],
          }),
        },
      ]
    }

    // L1 -> L2 / Op Bridge
    if (
      sourceLayer.metadata?.is_l1 &&
      targetLayer.metadata?.op_bridge_id &&
      targetLayer.metadata?.op_denoms?.includes(denom)
    ) {
      return [
        {
          typeUrl: "/opinit.ophost.v1.MsgInitiateTokenDeposit",
          value: MsgInitiateTokenDeposit.fromPartial({
            sender: address,
            bridgeId: targetLayer.metadata?.op_bridge_id,
            to: recipientAddress,
            amount: { denom, amount },
          }),
        },
      ]
    }

    // L2 -> L1 / reverse Op Bridge
    if (
      targetLayer.metadata?.is_l1 &&
      sourceLayer.metadata?.op_bridge_id &&
      sourceLayer.metadata?.op_denoms?.includes(getL1Denom(denom, sourceLayer))
    ) {
      if (!(ibcChannelFromSourceToTarget && ibcChannelFromTargetToSource)) throw new Error("IBC channel not found")

      const offerMetadata = denomToMetadata(getIBCDenom(ibcChannelFromTargetToSource, denom))
      const returnMetadata = denomToMetadata(getL1Denom(denom, sourceLayer))

      return [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sender: address,
            sourcePort: "transfer",
            sourceChannel: ibcChannelFromSourceToTarget,
            token: { denom, amount },
            timeoutTimestamp: calcTimeoutIBC(10),
            receiver: `${modules.swap_transfer}::swap_transfer::minit_swap_to`,
            memo: createHook({
              module_address: modules.swap_transfer,
              module_name: "swap_transfer",
              function_name: "minit_swap_to",
              type_args: [],
              args: [
                bcs.address().serialize(offerMetadata).toBase64(),
                bcs.address().serialize(returnMetadata).toBase64(),
                bcs.u64().serialize(amount).toBase64(),
                bcs.option(bcs.u64()).serialize(minimum).toBase64(),
                bcs.address().serialize(recipientAddress).toBase64(),
              ],
            }),
          }),
        },
      ]
    }

    // L2 -> L1 -> L2
    // L2 -> L1: reverse Op Bridge
    // L1 -> L2: IBC
    if (
      sourceLayer.metadata?.op_bridge_id &&
      sourceLayer.metadata?.op_denoms?.includes(getL1Denom(denom, sourceLayer)) &&
      targetLayer.metadata?.op_bridge_id &&
      targetLayer.metadata?.op_denoms?.includes(getL1Denom(denom, targetLayer))
    ) {
      if (!(ibcChannelFromSourceToL1 && ibcChannelFromL1ToSource)) throw new Error("IBC channel not found")
      const offerMetadata = denomToMetadata(getIBCDenom(ibcChannelFromL1ToSource, denom))
      const returnMetadata = denomToMetadata(getL1Denom(denom, sourceLayer))

      return [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sender: address,
            sourcePort: "transfer",
            sourceChannel: ibcChannelFromSourceToL1,
            token: { denom, amount },
            timeoutTimestamp: calcTimeoutIBC(10),
            receiver: `${modules.swap_transfer}::swap_transfer::minit_swap_deposit`,
            memo: createHook({
              module_address: modules.swap_transfer,
              module_name: "swap_transfer",
              function_name: "minit_swap_deposit",
              type_args: [],
              args: [
                bcs.address().serialize(offerMetadata).toBase64(),
                bcs.address().serialize(returnMetadata).toBase64(),
                bcs.u64().serialize(amount).toBase64(),
                bcs.option(bcs.u64()).serialize(minimum).toBase64(),
                bcs.u64().serialize(targetLayer.metadata?.op_bridge_id).toBase64(),
                bcs.address().serialize(recipientAddress).toBase64(),
                bcs.vector(bcs.u8()).serialize([]).toBase64(),
              ],
            }),
          }),
        },
      ]
    }

    // IBC
    if (ibcChannelFromSourceToTarget) {
      return [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sender: address,
            sourcePort: "transfer",
            sourceChannel: ibcChannelFromSourceToTarget,
            token: { denom, amount },
            timeoutTimestamp: calcTimeoutIBC(10),
            receiver: recipientAddress,
          }),
        },
      ]
    }

    // L2 -> L1 -> L2 / IBC
    if (ibcChannelFromSourceToL1 && ibcChannelFromL1ToTarget && ibcChannelFromL1ToSource) {
      const [messageFromL1ToTarget] = new Tx({ ...this.tx.params, layer: layer1 })
        .send({ ...this.sendParams, denom: getL1Denom(denom, sourceLayer) })
        .getMessages(params)

      if (messageFromL1ToTarget.typeUrl === "/opinit.ophost.v1.MsgInitiateTokenDeposit") {
        if (!targetLayer.metadata) throw new Error("Layer metadata not found")

        const depositMsg = {
          "@type": "/opinit.ophost.v1.MsgInitiateTokenDeposit",
          sender: deriveIntermediateSender(ibcChannelFromL1ToSource, address),
          bridgeId: targetLayer.metadata?.op_bridge_id,
          to: recipientAddress,
          amount: { denom: getL1Denom(denom, sourceLayer), amount },
        }

        return [
          {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: MsgTransfer.fromPartial({
              sender: address,
              sourcePort: "transfer",
              sourceChannel: ibcChannelFromSourceToL1,
              token: { denom, amount },
              timeoutTimestamp: calcTimeoutIBC(10),
              receiver: "0x1::cosmos::stargate",
              memo: createHook({
                module_address: "0x1",
                module_name: "cosmos",
                function_name: "stargate",
                type_args: [],
                args: [
                  bcs
                    .string()
                    .serialize(required(JSON.stringify(depositMsg)))
                    .toBase64(),
                ],
              }),
            }),
          },
        ]
      }

      if (messageFromL1ToTarget.typeUrl === "/ibc.applications.transfer.v1.MsgTransfer") {
        const tokenMetadata = denomToMetadata(getL1Denom(denom, sourceLayer))

        return [
          {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: MsgTransfer.fromPartial({
              sender: address,
              sourcePort: "transfer",
              sourceChannel: ibcChannelFromSourceToL1,
              token: { denom, amount },
              timeoutTimestamp: calcTimeoutIBC(10),
              receiver: "0x1::cosmos::transfer",
              memo: createHook({
                module_address: "0x1",
                module_name: "cosmos",
                function_name: "transfer",
                type_args: [],
                args: [
                  bcs.string().serialize(recipientAddress).toBase64(),
                  bcs.address().serialize(tokenMetadata).toBase64(),
                  bcs.u64().serialize(amount).toBase64(),
                  bcs.string().serialize("transfer").toBase64(),
                  bcs.string().serialize(ibcChannelFromL1ToTarget).toBase64(),
                  bcs.u64().serialize(0).toBase64(),
                  bcs.u64().serialize(0).toBase64(),
                  bcs.u64().serialize(calcTimeoutIBC(10)).toBase64(),
                  bcs.string().serialize("").toBase64(),
                ],
              }),
            }),
          },
        ]
      }
    }

    throw new Error("Not supported yet")
  }
}

function deriveIntermediateSender(channel: string, originSender: string): string {
  const senderPrefix = "ibc-move-hook-intermediary"
  const senderStr = `${channel}/${originSender}`
  const prefixHash = sha256(Buffer.from(senderPrefix))
  return AddressUtils.toBech32(
    Buffer.from(sha256(new Uint8Array([...prefixHash, ...Buffer.from(senderStr)]))).toString("hex"),
  )
}
