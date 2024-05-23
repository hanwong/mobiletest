import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import type { Algo, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { fromBase64 } from "@cosmjs/encoding"
import { request } from "../page"

export default class OfflineSigner implements OfflineDirectSigner {
  constructor(private readonly chainId: string) {}

  async getAccounts() {
    const address = await request("requestAddress", this.chainId)
    const { publicKey } = await request("requestAccount")
    return [{ address, algo: "secp256k1" as Algo, pubkey: new Uint8Array(fromBase64(publicKey.value)) }]
  }

  async signDirect(signerAddress: string, signDoc: SignDoc) {
    return request("requestSign", { chainId: this.chainId, signerAddress, signDoc })
  }
}
