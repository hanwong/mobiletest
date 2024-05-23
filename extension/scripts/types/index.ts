import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import type { Pubkey } from "@cosmjs/amino"
import type { DirectSignResponse } from "@cosmjs/proto-signing"
import type { DeliverTxResponse, StdFee } from "@cosmjs/stargate"
import type { Chain } from "@initia/initia-registry-types"
import z from "zod"

export interface RequestMethod {
  <T extends keyof Methods>(method: T, args?: Methods[T][0]): Promise<Methods[T][1]>
}

interface Methods {
  requestAddress: [string, string]
  requestAccount: [undefined, Account]
  requestSign: [DirectSignArgs, DirectSignResponse]
  requestSignAndBroadcastSync: [SignAndBroadcastArgs, string]
  requestSignAndBroadcastBlock: [SignAndBroadcastArgs, DeliverTxResponse]
  requestSignAndBroadcast: [SignAndBroadcastArgs, DeliverTxResponse]
  requestAddInitiaLayer: [Chain, void]
  requestSignArbitrary: [string | Uint8Array, string]
  requestVerifyArbitrary: [{ data: string | Uint8Array; sig: string }, boolean]

  /* vault */
  getInitialized: [undefined, boolean]
  initializeVault: [string, void]
  changePassword: [{ oldPassword: string; newPassword: string }, void]
  getLocked: [undefined, boolean]
  lock: [undefined, void]
  unlock: [string, void]

  /* accounts */
  getInitiaAddress: [undefined, string]
  getChainAddress: [string | number, string]
  getCurrentChainAddress: [undefined, string]
  getAccount: [undefined, Account]
  setAccount: [string, void]
  getAccounts: [undefined, Account[]]
  createAccount: [CreateAccountParams, void]
  changeAccountName: [{ address: string; name: string }, void]
  deleteAccount: [string, void]

  /* layers */
  initLayers: [undefined, Chain[]]
  getLayers: [undefined, Chain[]]
  getRegisteredLayers: [undefined, Chain[]]
  getCustomLayers: [undefined, Chain[]]
  addLayer: [Chain, void]
  addCustomLayer: [Chain, void]
  deleteLayer: [string, void]

  /* requested: permission */
  getRequestedPermission: [undefined, Sender | void]
  approveRequestedPermission: [undefined, void]
  rejectRequestedPermission: [undefined, void]
  getAuthorizedPermission: [undefined, Authorized]
  deleteAuthorizedPermission: [string, void]

  /* requested: Layer */
  getRequestedLayer: [undefined, { layer: Chain; sender: Sender }]
  approveRequestedLayer: [undefined, void]
  rejectRequestedLayer: [undefined, void]

  /* requested: SignDoc */
  getRequestedSignDoc: [undefined, WithMaybeSender<DirectSignArgs>]
  approveRequestedSignDoc: [undefined, void]
  rejectRequestedSignDoc: [undefined, void]

  /* requested: Tx */
  getRequestedTx: [undefined, WithMaybeSender<SignAndBroadcastArgs>]
  approveRequestedTx: [StdFee, void]
  rejectRequestedTx: [undefined, void]

  /* requested: Arbitrary */
  getRequestedArbitrary: [undefined, WithMaybeSender<{ data: string | Uint8Array }>]
  approveRequestedArbitrary: [undefined, void]
  rejectRequestedArbitrary: [undefined, void]

  /* tx */
  simulateCosmosTx: [SignAndBroadcastArgs, number]
  signAndBroadcastCosmosTx: [SignParams, DeliverTxResponse]
  getPrivateKey: [string, string]

  /* preferences */
  getPreferences: [undefined, Preferences]
  setPreferences: [Partial<Preferences>, void]
}

export interface Sender {
  url: string
  favicon?: string
}

export interface Authorized {
  [url: string]: Sender
}

export type Account = MnemonicAccount | PrivateKeyAccount

interface BaseAccount {
  name: string
  initiaAddress: string
  /** publicKey.value is base64 encoded */
  publicKey: Pubkey
}

interface MnemonicAccount extends BaseAccount {
  type: "mnemonic"
  ethereumAddress: string
}

interface PrivateKeyAccount extends BaseAccount {
  type: "privateKey"
  ethereumAddress: string
  payload?: UserInfo
}

export type CreateAccountParams = CreateAccountParamsMnemonic | CreateAccountParamsPrivateKey

export interface CreateAccountParamsMnemonic {
  mnemonic: string
  index: number
}

export interface CreateAccountParamsPrivateKey {
  privateKey: string
  payload?: UserInfo
}

export interface UserInfo {
  provider: string
  name?: string
  email?: string
}

type WithMaybeSender<T> = { sender?: Sender } & T

export interface DirectSignArgs {
  chainId: string
  signerAddress: string
  signDoc: SignDoc
}

export const SignAndBroadcastArgsSchema = z.object({
  chainId: z.string(),
  txBody: z.any(),
})

export interface SignAndBroadcastArgs {
  chainId: string
  txBody: Uint8Array
}

export interface SignParams extends SignAndBroadcastArgs {
  fee: StdFee
}

export interface Preferences {
  gasAdjustment?: number
  timeoutMinutes?: number
}
