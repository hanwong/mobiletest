import type { OfflineSigner } from "@cosmjs/proto-signing"
import type { Chain } from "@initia/initia-registry-types"
import type { InitiaWebViewWallet } from "../../shared/types"
import BaseSigner from "../base/BaseSigner"

export default class InitiaWebViewSigner extends BaseSigner {
  private wallet: InitiaWebViewWallet

  constructor(protected chain: Chain) {
    if (!window.initiaWebView) {
      throw new Error("Initia Wallet not found")
    }

    super(chain)
    this.wallet = window.initiaWebView
  }

  protected async getOfflineSigner(): Promise<OfflineSigner> {
    return this.wallet.getOfflineSigner(this.chain.chain_id)
  }

  public async signArbitrary(): Promise<string> {
    throw new Error("Not implemented")
  }

  public async verifyArbitrary(): Promise<boolean> {
    throw new Error("Not implemented")
  }
}
