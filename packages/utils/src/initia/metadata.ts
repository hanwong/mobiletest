import { sha3_256 } from "@noble/hashes/sha3"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import bcs from "./bcs"

export function primaryCoinStore(owner: string, coinMetadata: string) {
  const OBJECT_DERIVED_SCHEME = 0xfc
  const ownerBytes = Buffer.from(bcs.address().serialize(owner).toBytes()).toJSON().data
  const metadataBytes = Buffer.from(bcs.address().serialize(coinMetadata).toBytes()).toJSON().data
  const bytes = ownerBytes.concat(metadataBytes)
  bytes.push(OBJECT_DERIVED_SCHEME)
  const sum = sha3_256.create().update(Buffer.from(bytes)).digest()
  return Buffer.from(sum).toString("hex")
}

export function coinMetadata(creator: string, symbol: string) {
  const OBJECT_FROM_SEED_ADDRESS_SCHEME = 0xfe
  const addrBytes = Buffer.from(bcs.address().serialize(creator).toBytes()).toJSON().data
  const seed = Buffer.from(symbol, "ascii").toJSON().data
  const bytes = addrBytes.concat(seed)
  bytes.push(OBJECT_FROM_SEED_ADDRESS_SCHEME)
  const sum = sha3_256.create().update(Buffer.from(bytes)).digest()
  return Buffer.from(sum).toString("hex")
}

export function denomToMetadata(denom: string) {
  if (denom.startsWith("move/")) {
    return "0x" + denom.slice(5)
  } else {
    return "0x" + coinMetadata("0x1", denom)
  }
}

function denomToHash(channelId: string, denom: string) {
  const fullTrace = `transfer/${channelId}/${denom}`
  const shaSum = sha256(Buffer.from(fullTrace))
  return bytesToHex(shaSum)
}

export function getIBCDenom(channelId: string, denom: string) {
  return "ibc/" + denomToHash(channelId, denom).toUpperCase()
}

function be(num: bigint): number[] {
  return num ? be(num >> 8n).concat([Number(num % 256n)]) : []
}

function u64BE(num: bigint) {
  const b = be(num)
  return Buffer.from(
    Array(8 - b.length)
      .fill(0)
      .concat(b),
  )
}

export function getOpDenom(id: bigint, l1Denom: string) {
  const sum = sha3_256
    .create()
    .update(Buffer.from([...u64BE(id), ...Buffer.from(l1Denom)]))
    .digest()

  return `l2/${Buffer.from(sum).toString("hex")}`
}
