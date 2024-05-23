import type { OfflineDirectSigner } from "@cosmjs/proto-signing"
import type { Chain } from "@initia/initia-registry-types"
import type { PairingTypes, SessionTypes } from "@walletconnect/types"
import { default as BaseSigner } from "../base/BaseSigner"

export default class InitiaMobileSigner extends BaseSigner {
  protected chain: Chain
  private signClient?
  private web3Modal?
  private session?
  private signingChain?
  private caipChainId
  sessions: SessionTypes.Struct[]
  pairings: PairingTypes.Struct[]
  constructor(chain: Chain)
  protected getOfflineSigner(): Promise<OfflineDirectSigner>
  init(): Promise<void>
  private subscribeToEvents
  get pairing(): PairingTypes.Struct | undefined
  restorePairings(): void
  deleteInactivePairings(): Promise<void>
  deleteAllPairings(): Promise<void>
  restoreSessions(): void
  connect(): Promise<string>
  disconnect(): Promise<void>
  signArbitrary(): Promise<string>
  verifyArbitrary(): Promise<boolean>
  signAndBroadcastSync(chainId: string, tx: Uint8Array): Promise<string>
  signAndBroadcastBlock(chainId: string, tx: Uint8Array): Promise<string>
  requestAddInitiaLayer(layer: Chain): Promise<void>
}
