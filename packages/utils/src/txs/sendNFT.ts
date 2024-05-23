import axios from "axios"
import { sha256 } from "@noble/hashes/sha256"
import { ethers } from "ethers"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { MsgExecute } from "@initia/initia.proto/initia/move/v1/tx"
import { MsgCall } from "@initia/initia.proto/minievm/evm/v1/tx"
import { MsgTransfer } from "@initia/initia.proto/ibc/applications/nft_transfer/v1/tx"
import type { Chain } from "@initia/initia-registry-types"
import { AccAddress } from "@initia/initia.js"
import { required } from "../common"
import { bcs, coinMetadata } from "../initia"
import { findNftTransferChannel, getRest } from "../layer"
import { createInitiaNftClient } from "../queries"
import { calcTimeoutIBC, createHook } from "./utils"
import type { Tx } from "./tx"

export interface SendNFTParams {
  collectionAddress: string
}

export class SendNFT {
  constructor(
    private tx: Tx,
    private sendNFTParams: SendNFTParams,
  ) {}

  async getMessages({
    targetLayer,
    recipientAddress,
    tokens,
  }: {
    targetLayer: Chain
    recipientAddress: string
    tokens: {
      collection_addr: string
      collection_name: string
      nft: { token_id: string; uri: string; description: string }
      object_addr: string
    }[]
  }) {
    const { address, layer1, layer: sourceLayer } = this.tx.params
    const { collectionAddress } = this.sendNFTParams

    if (!sourceLayer || !targetLayer) throw new Error("Layer not found")
    if (!recipientAddress) throw new Error("Recipient address is required")

    const sourceChainId = sourceLayer.chain_id
    const targetChainId = targetLayer.chain_id

    if (!targetChainId || sourceChainId === targetChainId) {
      // move
      if (sourceLayer.metadata?.is_l1 || sourceLayer.metadata?.minitia?.type === "minimove") {
        return tokens.map(({ object_addr }) => ({
          typeUrl: "/initia.move.v1.MsgExecute",
          value: MsgExecute.fromPartial({
            sender: address,
            moduleAddress: "0x1",
            moduleName: "object",
            functionName: "transfer",
            typeArgs: ["0x1::nft::Nft"],
            args: [bcs.address().serialize(object_addr).toBytes(), bcs.address().serialize(recipientAddress).toBytes()],
          }),
        }))
        // wasm
      } else if (sourceLayer.metadata?.minitia?.type === "miniwasm") {
        return tokens.map(({ collection_addr, nft }) => ({
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: MsgExecuteContract.fromPartial({
            sender: address,
            contract: collection_addr,
            msg: Buffer.from(JSON.stringify({ transfer_nft: { recipient: recipientAddress, token_id: nft.token_id } })),
            funds: [],
          }),
        }))
        // evm
      } else if (sourceLayer.metadata?.minitia?.type === "minievm") {
        return tokens.map(({ collection_addr, nft }) => {
          const contract = new ethers.Contract(collection_addr, erc721ABI)
          return {
            typeUrl: "/minievm.evm.v1.MsgCall",
            value: MsgCall.fromPartial({
              sender: address,
              contractAddr: collection_addr,
              input: contract.interface.encodeFunctionData("transferFrom", [
                address.startsWith("init1") ? AccAddress.toHex(address) : address,
                address.startsWith("init1") ? AccAddress.toHex(recipientAddress) : recipientAddress,
                nft.token_id,
              ]),
            }),
          }
        })
      } else {
        throw new Error("Unknown minitia type")
      }
    }
    const tokenIds = tokens.map(({ nft: { token_id } }) => token_id)

    // via IBC
    const ibcChannel = findNftTransferChannel(sourceLayer, targetLayer)
    if (ibcChannel) {
      if (sourceLayer.metadata?.minitia?.type === "miniwasm") {
        return tokens.map(({ collection_addr, nft }) => ({
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: MsgExecuteContract.fromPartial({
            sender: address,
            contract: collection_addr,
            msg: Buffer.from(
              JSON.stringify({
                send_nft: {
                  contract: ibcChannel.port_id.split(".")[1],
                  token_id: nft.token_id,
                  msg: Buffer.from(
                    JSON.stringify({
                      receiver: recipientAddress,
                      channel_id: ibcChannel.channel_id,
                      timeout: {
                        timestamp: calcTimeoutIBC(10).toString(),
                      },
                    }),
                  ).toString("base64"),
                },
              }),
            ),
            funds: [],
          }),
        }))
      }

      return [
        {
          typeUrl: "/ibc.applications.nft_transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sourcePort: ibcChannel.port_id,
            sourceChannel: ibcChannel.channel_id,
            classId: await this.getClassId(collectionAddress, getRest(sourceLayer)),
            tokenIds: tokenIds,
            sender: address,
            receiver: recipientAddress,
            timeoutTimestamp: calcTimeoutIBC(10).toString(),
          }),
        },
      ]
    }

    // L2 -> L1 -> L2
    const ibcChannelFromSourceToL1 = findNftTransferChannel(sourceLayer, layer1)
    const ibcChannelFromL1ToSource = findNftTransferChannel(layer1, sourceLayer)
    const ibcChannelFromL1ToTarget = findNftTransferChannel(layer1, targetLayer)
    if (!ibcChannelFromSourceToL1) throw new Error("Not supported yet")
    if (!ibcChannelFromL1ToSource) throw new Error("Not supported yet")
    if (!ibcChannelFromL1ToTarget) throw new Error("Not supported yet")
    if (!targetLayer.metadata) throw new Error("Layer metadata not found")

    const targetChainCollectionAddress = await this.getTargetChainCollectionAddress(
      collectionAddress,
      required(ibcChannelFromL1ToSource.port_id),
      required(ibcChannelFromL1ToSource.channel_id),
      getRest(sourceLayer),
    )

    const hook = createHook({
      module_address: "0x1",
      module_name: "cosmos",
      function_name: "nft_transfer",
      type_args: [],
      args: [
        bcs.string().serialize(recipientAddress).toBase64(),
        bcs.address().serialize(targetChainCollectionAddress).toBase64(),
        bcs.vector(bcs.string()).serialize(tokenIds).toBase64(),
        bcs.string().serialize(ibcChannelFromL1ToTarget.port_id).toBase64(),
        bcs.string().serialize(ibcChannelFromL1ToTarget.channel_id).toBase64(),
        bcs.u64().serialize(0).toBase64(),
        bcs.u64().serialize(0).toBase64(),
        bcs.u64().serialize(calcTimeoutIBC(10)).toBase64(),
        bcs.string().serialize("").toBase64(),
      ],
    })

    if (sourceLayer.metadata?.minitia?.type === "miniwasm") {
      return tokens.map(({ collection_addr, nft }) => ({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: address,
          contract: collection_addr,
          msg: Buffer.from(
            JSON.stringify({
              send_nft: {
                contract: ibcChannelFromSourceToL1.port_id.split(".")[1],
                token_id: nft.token_id,
                msg: Buffer.from(
                  JSON.stringify({
                    receiver: "0x1::cosmos::nft_transfer",
                    channel_id: ibcChannelFromSourceToL1.channel_id,
                    timeout: {
                      timestamp: calcTimeoutIBC(10).toString(),
                    },
                    memo: hook,
                  }),
                ).toString("base64"),
              },
            }),
          ),
          funds: [],
        }),
      }))
    }

    return [
      {
        typeUrl: "/ibc.applications.nft_transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sourcePort: ibcChannelFromSourceToL1.port_id,
          sourceChannel: ibcChannelFromSourceToL1.channel_id,
          classId: await this.getClassId(collectionAddress, getRest(sourceLayer)),
          tokenIds: tokenIds,
          sender: address,
          receiver: "0x1::cosmos::nft_transfer",
          timeoutTimestamp: calcTimeoutIBC(10).toString(),
          memo: hook,
        }),
      },
    ]
  }

  private transformAddress(address: string): string {
    const addressWithoutPrefix = address.startsWith("0x") ? address.slice(2) : address
    return addressWithoutPrefix.padStart(64, "0")
  }

  private async getClassId(collectionAddress: string, rest: string) {
    const client = createInitiaNftClient(rest, collectionAddress, "minimove")
    const { creator, name } = await client.getCollectionInfo()

    if (creator === "0x1" && name.startsWith("ibc/")) {
      return name
    }

    return `move/${this.transformAddress(collectionAddress)}`
  }

  private async getTargetChainCollectionAddress(
    collectionAddress: string,
    targetPortId: string,
    targetChannelId: string,
    sourceChainLcdUrl: string,
  ) {
    const classId = await this.getClassId(collectionAddress, sourceChainLcdUrl)
    if (classId.startsWith("ibc/")) {
      const hash = classId.slice(4)
      const { data: trace } = await axios.get<{ class_trace: { path: string; base_class_id: string } }>(
        `/ibc/apps/nft_transfer/v1/class_traces/${hash}`,
        { baseURL: sourceChainLcdUrl },
      )
      return trace.class_trace.base_class_id.slice(5)
    } else {
      const fullTrace = `${targetPortId}/${targetChannelId}/${classId}`
      const shaSum = sha256(Buffer.from(fullTrace))
      const hash = Buffer.from(shaSum).toString("hex").toUpperCase()
      const name = `ibc/${hash}`
      return coinMetadata("0x1", name)
    }
  }
}

const erc721ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]
