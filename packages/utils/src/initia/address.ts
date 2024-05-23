import { bech32 } from "bech32"

export function decodeAddress(address: string, byteLength = 20): Buffer {
  if (!address) throw new Error("Address is required")

  if (address.startsWith("0x") || /^[a-fA-F0-9]+$/.test(address)) {
    const hex = address.replace(/^0x/, "").padStart(byteLength * 2, "0")
    return Buffer.from(hex, "hex")
  }

  const { words } = bech32.decode(address)
  const buffer = Buffer.from(bech32.fromWords(words))
  return buffer.length >= byteLength ? buffer : Buffer.concat([Buffer.alloc(byteLength - buffer.length), buffer])
}

export class AddressUtils {
  static toBuffer(address: string): Buffer {
    return decodeAddress(address)
  }

  static toHex(address: string): string {
    try {
      const buffer = AddressUtils.toBuffer(address)
      return buffer.toString("hex")
    } catch {
      return ""
    }
  }

  static toPrefixedHex(address: string): string {
    const hex = AddressUtils.toHex(address)
    if (!hex) return ""
    return "0x" + hex.replace(/^0+/, "")
  }

  static toBech32(address: string, prefix = "init"): string {
    try {
      const buffer = AddressUtils.toBuffer(address)
      const words = bech32.toWords(buffer)
      return bech32.encode(prefix, words)
    } catch {
      return ""
    }
  }

  static isEqual(address1: string, address2: string): boolean {
    try {
      const normalizedAddress1 = AddressUtils.toBech32(address1)
      const normalizedAddress2 = AddressUtils.toBech32(address2)
      return normalizedAddress1 === normalizedAddress2
    } catch {
      return false
    }
  }

  static isValid(address: string, prefix = "init"): boolean {
    try {
      return bech32.decode(address).prefix === prefix
    } catch (error) {
      return false
    }
  }
}
