import type { Eip1193Provider, SignatureLike } from "ethers"
import { ethers, isError } from "ethers"
import { Data } from "@initia/utils"
import { Secp256k1 } from "@cosmjs/crypto"
import { SIGN_MESSAGE } from "../../shared/constants"

export default class EthereumUtils {
  private provider: ethers.BrowserProvider

  constructor(ethereum: Eip1193Provider) {
    this.provider = new ethers.BrowserProvider(ethereum)
  }

  public async personalSign(message: Data): Promise<Data> {
    try {
      const signer = await this.provider.getSigner()
      const signed = await signer.signMessage(message.buffer)
      return new Data(signed)
    } catch (error) {
      if (isError(error, "ACTION_REJECTED")) throw new Error(error.shortMessage)
      throw error
    }
  }

  public async verifyMessage(message: Data, sig: SignatureLike): Promise<boolean> {
    const signer = await this.provider.getSigner()
    const address = await signer.getAddress()
    return ethers.verifyMessage(message.buffer, sig) === address
  }

  public async fetchPublicKey(): Promise<Data> {
    const publicKeyCache = localStorage.getItem("ethereum:cached-public-key")

    if (publicKeyCache) {
      return new Data(publicKeyCache)
    }

    const message = new Data(SIGN_MESSAGE)
    const signature = await this.personalSign(message)
    const cachedPublicKey = this.recoverPublicKey(message, signature)
    localStorage.setItem("ethereum:cached-public-key", cachedPublicKey.prefixedHex)
    return cachedPublicKey
  }

  public clearCachedPublicKey() {
    localStorage.removeItem("ethereum:cached-public-key")
  }

  public recoverPublicKey(message: Data, signature: Data): Data {
    const messageHash = ethers.hashMessage(ethers.getBytes(message.prefixedHex))
    const uncompressedPublicKey = ethers.SigningKey.recoverPublicKey(messageHash, signature.prefixedHex)
    const compressedPublicKey = Secp256k1.compressPubkey(new Data(uncompressedPublicKey).buffer)
    return new Data(Buffer.from(compressedPublicKey))
  }
}
