import type Transport from "@ledgerhq/hw-transport"
import TransportWebHID from "@ledgerhq/hw-transport-webhid"
import { LedgerSigner as LedgerAminoSigner } from "@cosmjs/ledger-amino"
import type { OfflineAminoSigner } from "@keplr-wallet/types"
import type { Chain } from "@initia/initia-registry-types"
import BaseSigner from "../base/BaseSigner"

export default class LedgerSigner extends BaseSigner {
  private static transport: Transport | null = null

  constructor(protected chain: Chain) {
    super(chain)
  }

  private async getTransport(): Promise<Transport> {
    if (!LedgerSigner.transport) {
      LedgerSigner.transport = await TransportWebHID.create()
    }

    return LedgerSigner.transport
  }

  protected async getOfflineSigner(): Promise<OfflineAminoSigner> {
    const transport = await this.getTransport()
    return new LedgerAminoSigner(transport, { prefix: "init" })
  }

  public async disconnect(): Promise<void> {
    if (LedgerSigner.transport) {
      await LedgerSigner.transport.close()
      LedgerSigner.transport = null
    }

    await super.disconnect()
  }

  public async signArbitrary(): Promise<string> {
    throw new Error("Not implemented")
  }

  public async verifyArbitrary(): Promise<boolean> {
    throw new Error("Not implemented")
  }
}
