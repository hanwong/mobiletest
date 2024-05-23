import type { Algo, OfflineDirectSigner, DirectSignResponse } from "@cosmjs/proto-signing"
import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import type { Pubkey } from "@cosmjs/amino"
import { fromBase64 } from "@cosmjs/encoding"
import type { AccountData } from "@keplr-wallet/types"
import type SignClient from "@walletconnect/sign-client"
import type { SessionTypes } from "@walletconnect/types"
import { encode, decode } from "@initia/utils"

export default class InitiaMobileOfflineSigner implements OfflineDirectSigner {
  constructor(
    private readonly signClient: SignClient,
    private readonly session: SessionTypes.Struct,
    private readonly chainId: string,
  ) {}

  public async getAccounts() {
    const namespaces = this.session.namespaces
    if (!namespaces) throw new Error("Wallet not found")

    const caipChainId = `cosmos:${this.chainId}`
    const chain = Object.keys(namespaces)[0]
    const accounts = namespaces[chain].accounts[0]
    const account = accounts.replace(caipChainId + ":", "")
    const [address, key] = account.split("&")
    const publicKey = JSON.parse(window.atob(key)) as Pubkey

    return [{ address, algo: "secp256k1" as Algo, pubkey: new Uint8Array(fromBase64(publicKey.value)) } as AccountData]
  }

  public async signDirect(signerAddress: string, signDoc: SignDoc) {
    const caipChainId = `cosmos:${this.chainId}`
    const signResponse = await this.signClient.request<string>({
      topic: this.session.topic,
      chainId: caipChainId,
      request: {
        method: "signRequest",
        params: {
          signerAddress,
          signDoc: encode(signDoc),
        },
      },
    })

    return decode(signResponse) as DirectSignResponse
  }
}
