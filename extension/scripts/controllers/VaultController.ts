import bip39 from "bip39"
import { BIP32Factory } from "bip32"
import ecc from "@bitcoinerlab/secp256k1"
import { decrypt, encrypt } from "@metamask/browser-passworder"
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import { sleep } from "@cosmjs/utils"
import { stringToPath } from "@cosmjs/crypto"
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing"
import type { Account, DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate"
import { isDeliverTxFailure } from "@cosmjs/stargate"
import { SigningStargateClientCache, TimeoutError, defined, getRPC } from "@initia/utils"
import registry, { decodeTxBody } from "../cosmos/registry"
import type { SignAndBroadcastArgs, SignParams } from "../types"
import storage from "../storage"
import { accountsController, layersController } from "../data/controllers"
import { locked, selectedInitiaAddress } from "../data/subjects"

const bip32 = BIP32Factory(ecc)

interface Keys {
  [address: string]: Key
}

type Key = { mnemonic: string; index: number } | { privateKey: string }

const STORAGE_KEY = "Vault"

class VaultController {
  #password = ""
  #account: Map<string, Account> = new Map()

  async initialize(password: string) {
    const vault = await encrypt(password, {})
    await storage.set(STORAGE_KEY, vault)
    this.unlock(password)
  }

  async getInitialized() {
    const vault = await storage.get<string>(STORAGE_KEY)
    return !!vault
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const vault = await this.getVault()
    const keys = await decrypt(oldPassword, vault)
    const next = await encrypt(newPassword, keys)
    await storage.set(STORAGE_KEY, next)
    this.unlock(newPassword)
  }

  private async getVault() {
    const vault = await storage.get<string>(STORAGE_KEY)
    if (!vault) throw new Error("No vault exists")
    return vault
  }

  private async getKeys() {
    const vault = await this.getVault()
    return decrypt(this.#password, vault) as Promise<Keys>
  }

  private async getKey(address = selectedInitiaAddress.value) {
    const keys = await this.getKeys()
    const key = keys[address]
    if (!key) throw new Error("No key exists")
    return key
  }

  async getCosmosWallet() {
    const key = await this.getKey()
    const prefix = "init"
    if ("mnemonic" in key) {
      const { mnemonic, index } = key
      const hdPath = `m/44'/118'/0'/0/${index}`
      const options = { prefix, hdPaths: [stringToPath(hdPath)] }
      return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, options)
    } else if ("privateKey" in key) {
      const { privateKey } = key
      return DirectSecp256k1Wallet.fromKey(Buffer.from(privateKey, "hex"), prefix)
    } else {
      throw new Error("Invalid key")
    }
  }

  async getPrivateKey(address = selectedInitiaAddress.value) {
    const key = await this.getKey(address)
    if ("mnemonic" in key) {
      const { mnemonic, index } = key
      const seed = await bip39.mnemonicToSeed(mnemonic)
      const root = bip32.fromSeed(seed)
      const child = root.derivePath(`m/44'/118'/0'/0/${index}`)
      if (!child.privateKey) throw new Error("Failed to derive private key")
      return child.privateKey.toString("hex")
    } else if ("privateKey" in key) {
      const { privateKey } = key
      return privateKey
    } else {
      throw new Error("Invalid key")
    }
  }

  getRPC(chainId: string) {
    const layer = layersController.findLayer(chainId)
    defined(layer, "Layer not found")
    return getRPC(layer)
  }

  async getCosmosSigner(chainId: string) {
    const rpc = this.getRPC(chainId)
    const wallet = await this.getCosmosWallet()
    return SigningStargateClientCache.connectWithSigner(rpc, wallet, { registry, broadcastPollIntervalMs: 100 })
  }

  async simulateCosmosTx({ chainId, txBody }: SignAndBroadcastArgs) {
    const address = accountsController.initiaAddress
    const signer = await this.getCosmosSigner(chainId)
    const account = await signer.getAccount(address)
    if (account) this.#account.set(address, account)
    const { messages, memo } = decodeTxBody(txBody)
    return signer.simulate(address, messages, memo)
  }

  async pollTx(transactionHash: string, signer: SigningStargateClient, maxRetries = 30): Promise<DeliverTxResponse> {
    if (!signer) throw new Error("No signer")

    let retries = 0

    while (retries < maxRetries) {
      const tx = await signer.getTx(transactionHash)
      if (tx) return { ...tx, transactionHash }
      retries++
      await sleep(1000)
    }

    throw new TimeoutError(transactionHash)
  }

  async signAndBroadcastCosmosTxSync({ chainId, txBody, fee }: SignParams) {
    const address = accountsController.initiaAddress

    // signer
    const signer = await this.getCosmosSigner(chainId)

    // sign
    const { messages, memo } = decodeTxBody(txBody)
    if (!chainId) throw new Error("Failed to get chain ID")
    const account = this.#account.get(address) ?? (await signer.getAccount(address))
    if (!account) throw new Error("Failed to get account")
    const explicitSignerData = { chainId, ...account }
    const signed = await signer.sign(address, messages, fee, memo, explicitSignerData)

    // broadcast
    const tx = TxRaw.encode(signed).finish()
    return signer.broadcastTxSync(tx)
  }

  async signAndBroadcastCosmosTxBlock({ chainId, txBody, fee }: SignParams) {
    const signer = await this.getCosmosSigner(chainId)
    const hash = await this.signAndBroadcastCosmosTxSync({ chainId, txBody, fee })
    const response = await this.pollTx(hash, signer)
    if (isDeliverTxFailure(response)) throw new Error(response.rawLog)
    return response
  }

  async addKey(address: string, key: Key) {
    const keys = await this.getKeys()
    const next = await encrypt(this.#password, { ...keys, [address]: key })
    await storage.set(STORAGE_KEY, next)
  }

  async deleteKey(address: string) {
    const keys = await this.getKeys()
    delete keys[address]
    const next = await encrypt(this.#password, keys)
    await storage.set(STORAGE_KEY, next)
  }

  get locked() {
    return locked.value
  }

  lock() {
    this.#password = ""
    locked.next(true)
  }

  async unlock(password: string) {
    const vault = await this.getVault()
    await decrypt(password, vault)
    this.#password = password
    locked.next(false)
  }
}

export default VaultController
