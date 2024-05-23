import type { Chain } from "@initia/initia-registry-types"
import { required } from "./common"

export function getRPC(layer: Chain) {
  return required(layer.apis?.rpc?.[0]?.address, `RPC not found for ${layer.chain_id}`)
}

export function getRest(layer: Chain) {
  return required(layer.apis?.rest?.[0]?.address, `REST not found for ${layer.chain_id}`)
}

export function getAPI(layer: Chain) {
  return layer.apis?.api?.[0]?.address
}

export function findChannel(sourceChain: Chain, targetChain: Chain, type: "transfer" | "nft-transfer") {
  const ibcChannels = sourceChain.metadata?.ibc_channels
  const targetVersion = { transfer: "ics20-1", "nft-transfer": "ics721-1" }[type]
  return ibcChannels?.find(({ chain_id, version }) => chain_id === targetChain.chain_id && version === targetVersion)
}

export function findTransferChannelId(sourceChain: Chain, targetChain: Chain) {
  return findChannel(sourceChain, targetChain, "transfer")?.channel_id
}

export function findNftTransferChannel(sourceChain: Chain, targetChain: Chain) {
  return findChannel(sourceChain, targetChain, "nft-transfer")
}
