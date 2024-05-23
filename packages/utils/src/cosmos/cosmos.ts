import type { OfflineSigner } from "@cosmjs/proto-signing"
import type { SigningStargateClientOptions } from "@cosmjs/stargate"
import type { CometClient } from "@cosmjs/tendermint-rpc"
import { Comet38Client } from "@cosmjs/tendermint-rpc"
import { StargateClient, SigningStargateClient } from "@cosmjs/stargate"

export class CometClientCache {
  private static clients: Map<string, Comet38Client> = new Map()

  public static async connect(url: string) {
    if (!this.clients.has(url)) {
      const client = await Comet38Client.connect(url)
      this.clients.set(url, client)
      return client
    }

    return this.clients.get(url)!
  }
}

export class StargateClientCache {
  private static clients: Map<string, StargateClient> = new Map()

  public static async connect(url: string) {
    if (!this.clients.has(url)) {
      const cometClient = await CometClientCache.connect(url)
      const client = await StargateClient.create(cometClient as CometClient)
      this.clients.set(url, client)
      return client
    }

    return this.clients.get(url)!
  }
}

export class SigningStargateClientCache {
  private static clients: Map<string, SigningStargateClient> = new Map()

  public static async connectWithSigner(url: string, signer: OfflineSigner, options?: SigningStargateClientOptions) {
    const [{ address }] = await signer.getAccounts()
    const key = url + address

    if (!this.clients.has(key)) {
      const cometClient = await CometClientCache.connect(url)
      const client = await SigningStargateClient.createWithSigner(cometClient, signer, options)
      this.clients.set(key, client)
      return client
    }

    return this.clients.get(key)!
  }
}
