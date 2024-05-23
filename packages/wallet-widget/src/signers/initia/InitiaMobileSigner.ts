import type { OfflineDirectSigner } from "@cosmjs/proto-signing"
import type { DeliverTxResponse } from "@cosmjs/stargate"
import type { Chain } from "@initia/initia-registry-types"
import type { PairingTypes, SessionTypes } from "@walletconnect/types"
import SignClient from "@walletconnect/sign-client"
import { WalletConnectModal } from "@walletconnect/modal"
import { wcProjectId } from "../../stores/config"
import BaseSigner from "../base/BaseSigner"
import InitiaMobileOfflineSigner from "./InitiaMobileOfflineSigner"
import { getSdkError } from "@walletconnect/utils"

const globalContext = window ?? global

type ConnectResult = {
  uri: string | undefined
  approval: () => Promise<SessionTypes.Struct>
}

export default class InitiaMobileSigner extends BaseSigner {
  private signClient?: SignClient
  private web3Modal?: WalletConnectModal
  private session?: SessionTypes.Struct
  private signingChain?: Chain
  private caipChainId: string
  sessions: SessionTypes.Struct[] = []
  pairings: PairingTypes.Struct[] = []

  constructor(protected chain: Chain) {
    super(chain)
    this.caipChainId = `cosmos:${chain.chain_id}`
  }

  protected async getOfflineSigner(): Promise<OfflineDirectSigner> {
    if (!this.signClient || !this.session) throw new Error("Wallet not connected")
    return new InitiaMobileOfflineSigner(this.signClient, this.session, this.chain.chain_id)
  }

  public async init() {
    const appDescription = globalContext.document.getElementsByTagName("meta")?.namedItem("description")?.content
    const iconLink = (globalContext.document.querySelector("link[rel*='icon']") as HTMLLinkElement)?.href

    this.signClient = await SignClient.init({
      projectId: wcProjectId,
      metadata: {
        name: globalContext.document.title || "Initia dApp",
        description: appDescription || "",
        url: globalContext.location.origin || "",
        icons: [iconLink || "https://assets.initia.xyz/images/wallets/Initia.webp"],
      },
    })

    this.web3Modal = new WalletConnectModal({
      projectId: wcProjectId,
      chains: [this.caipChainId],
      mobileWallets: [
        {
          id: "initiaMobileWallet",
          name: "Initia Wallet",
          links: {
            native: "initiawallet://",
            universal: "https://link.initia.xyz",
          },
        },
      ],
      walletImages: {
        initiaMobileWallet: "https://assets.initia.xyz/images/wallets/Initia.webp",
      },
      themeVariables: {
        "--wcm-z-index": "10000",
      },
    })

    this.subscribeToEvents()
    this.restorePairings()
    this.restoreSessions()
  }

  private subscribeToEvents() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized")
    }

    this.signClient.on("session_delete", () => {
      globalContext.dispatchEvent(new Event("wc_disconnected"))
    })

    this.signClient.on("session_expire", () => {
      globalContext.dispatchEvent(new Event("wc_disconnected"))
    })

    this.signClient.on(
      "session_update",
      async ({ topic, params }: { topic: string; params: { namespaces: SessionTypes.Namespaces } }) => {
        const { namespaces } = params
        const _session = this.signClient?.session.get(topic)
        const updatedSession = { ..._session, namespaces } as SessionTypes.Struct
        this.session = updatedSession
        globalContext.dispatchEvent(new Event("wc_addressChanged"))
      },
    )
  }

  get pairing(): PairingTypes.Struct | undefined {
    return this.pairings[0]
  }

  restorePairings() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized")
    }
    this.pairings = this.signClient.pairing.getAll({ active: true }).filter((p) => p.expiry * 1000 > Date.now() + 1000)
  }

  async deleteInactivePairings() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized")
    }

    for (const pairing of this.signClient.pairing.getAll({ active: false })) {
      await this.signClient.pairing.delete(pairing.topic, {
        code: 7001,
        message: "Clear inactive pairings.",
      })
    }
  }

  async deleteAllPairings() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized")
    }

    for (const pairing of this.signClient.pairing.getAll()) {
      await this.signClient.pairing.delete(pairing.topic, {
        code: 7001,
        message: "Clear pairings.",
      })
    }
  }

  restoreSessions() {
    if (typeof this.signClient === "undefined" || typeof this.web3Modal === "undefined") {
      throw new Error("WalletConnect is not initialized")
    }

    this.sessions = this.signClient.session.getAll().filter((s) => s.expiry * 1000 > Date.now() + 1000)
  }

  public async connect(): Promise<string> {
    if (typeof this.web3Modal === "undefined") {
      throw new Error("WalletConnect is not initialized")
    }

    if (this.sessions.length) {
      this.session = this.sessions[0]
      return await super.connect()
    }

    this.restorePairings()
    const pairing = this.pairing

    let connectResp
    try {
      connectResp = (await this.signClient?.connect({
        pairingTopic: pairing?.topic,
        requiredNamespaces: {
          cosmos: {
            methods: ["txRequest", "signRequest"],
            chains: [this.caipChainId],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      })) as ConnectResult
    } catch (error) {
      console.error(error)
    }

    if (!connectResp?.uri) {
      window.indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB")
    }

    try {
      this.web3Modal.openModal({
        uri: connectResp?.uri,
        chains: [this.caipChainId],
      })
      const session = await connectResp?.approval()
      this.session = session
      session && this.sessions.push(session)
      this.restorePairings()
    } catch (error) {
      await this.deleteInactivePairings()
      if (!error) {
        throw new Error("Proposal Expired")
      } else {
        throw error
      }
    } finally {
      this.web3Modal.closeModal()
    }

    return await super.connect()
  }

  public async disconnect(): Promise<void> {
    if (!this.signClient || !this.session) throw new Error("Wallet not connected")

    await this.deleteAllPairings()

    this.signClient.disconnect({
      topic: this.session.topic,
      reason: getSdkError("USER_DISCONNECTED"),
    })

    this.session = undefined
    this.sessions = []

    await super.disconnect()
  }

  public async signArbitrary(): Promise<string> {
    throw new Error("Initia Wallet does not support arbitrary signing yet")
  }

  public async verifyArbitrary(): Promise<boolean> {
    throw new Error("Initia Wallet does not support arbitrary signing yet")
  }

  async signAndBroadcastBlock(chainId: string, tx: Uint8Array): Promise<string> {
    if (!this.signClient || !this.session) throw new Error("Wallet not connected")
    const iconLink = (globalContext.document.querySelector("link[rel*='icon']") as HTMLLinkElement)?.href

    const { transactionHash } = await this.signClient.request<DeliverTxResponse>({
      topic: this.session.topic,
      chainId: this.caipChainId,
      request: {
        method: "txRequest",
        params: {
          topic: this.session?.topic,
          chainId,
          tx,
          chain: this.signingChain,
          sender: {
            url: globalContext.location.origin,
            favicon: iconLink,
          },
        },
      },
    })
    return transactionHash
  }

  async requestAddInitiaLayer(layer: Chain): Promise<void> {
    this.signingChain = layer
  }
}
