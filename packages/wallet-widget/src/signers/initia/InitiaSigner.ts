import type { OfflineSigner } from "@cosmjs/proto-signing"
import type { Chain } from "@initia/initia-registry-types"
import type { InitiaWallet } from "../../shared/types"
import BaseSigner from "../base/BaseSigner"

export default class InitiaSigner extends BaseSigner {
  private wallet: InitiaWallet

  constructor(protected chain: Chain) {
    if (!window.initia) {
      throw new Error("Initia Wallet not found")
    }

    super(chain)
    this.wallet = window.initia
  }

  protected async getOfflineSigner(): Promise<OfflineSigner> {
    return this.wallet.getOfflineSigner(this.chain.chain_id)
  }

  async signAndBroadcastSync(chainId: string, tx: Uint8Array): Promise<string> {
    if (!this.wallet.signAndBroadcastSync) {
      return this.signAndBroadcastBlock(chainId, tx)
    }

    return this.wallet.signAndBroadcastSync(chainId, tx)
  }

  async signAndBroadcastBlock(chainId: string, tx: Uint8Array): Promise<string> {
    const { transactionHash } = await this.wallet.signAndBroadcast(chainId, tx)
    return transactionHash
  }

  async signArbitrary(data: string | Uint8Array): Promise<string> {
    return this.wallet.signArbitrary(data)
  }

  async verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean> {
    return this.wallet.verifyArbitrary(data, signature)
  }

  async requestAddInitiaLayer(layer: Chain): Promise<void> {
    await this.wallet.requestAddInitiaLayer(layer)
  }
}
