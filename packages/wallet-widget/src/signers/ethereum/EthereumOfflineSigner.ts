import type { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignDoc, StdSignature } from "@cosmjs/amino"
import { encodeSecp256k1Pubkey, encodeSecp256k1Signature, pubkeyToAddress } from "@cosmjs/amino"
import { sortedJsonStringify } from "@cosmjs/amino/build/signdoc"
import { Secp256k1Signature } from "@cosmjs/crypto"
import { Data } from "@initia/utils"
import { BECH32_PREFIX } from "../../shared/constants"
import type EthereumUtils from "./EthereumUtils"

export default class EthereumOfflineSigner implements OfflineAminoSigner {
  constructor(private utils: EthereumUtils) {}

  private deriveAddressFromPublicKey(publicKey: Data): string {
    return pubkeyToAddress(encodeSecp256k1Pubkey(publicKey.buffer), BECH32_PREFIX)
  }

  private async fetchAddress(): Promise<string> {
    const publicKey = await this.utils.fetchPublicKey()
    return this.deriveAddressFromPublicKey(publicKey)
  }

  private async sign(signDoc: StdSignDoc): Promise<StdSignature> {
    const compressedPublicKey = await this.utils.fetchPublicKey()
    const signDocAminoJSON = sortedJsonStringify(signDoc)
    const signatureHex = await this.utils.personalSign(new Data(signDocAminoJSON))
    const signatureBuffer = signatureHex.buffer.subarray(0, -1)
    const secp256signature = Secp256k1Signature.fromFixedLength(signatureBuffer)
    const signatureBytes = secp256signature.toFixedLength()
    return encodeSecp256k1Signature(compressedPublicKey.buffer, signatureBytes)
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    const publicKey = await this.utils.fetchPublicKey()

    return [
      {
        address: this.deriveAddressFromPublicKey(publicKey),
        algo: "secp256k1",
        pubkey: publicKey.buffer,
      },
    ]
  }

  public async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    const address = await this.fetchAddress()

    if (address !== signerAddress) {
      throw new Error("Signer address does not match the provided address")
    }

    const signature = await this.sign(signDoc)

    return { signed: signDoc, signature }
  }
}
