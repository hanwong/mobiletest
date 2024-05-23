import { encodeSecp256k1Pubkey } from "@cosmjs/amino"
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing"
import { stringToPath } from "@cosmjs/crypto"
import { HDNodeWallet, Wallet } from "ethers"
import type { CreateAccountParams, CreateAccountParamsMnemonic, CreateAccountParamsPrivateKey } from "../types"
import { accountsController, vaultController } from "../data/controllers"

class KeyringController {
  static async addAccount(params: CreateAccountParams) {
    if ("mnemonic" in params) {
      await KeyringController.addAccountFromMnemonic(params)
    } else if ("privateKey" in params) {
      await KeyringController.addAccountFromPrivateKey(params)
    } else {
      throw new Error("Invalid params")
    }
  }

  static async addAccountFromMnemonic({ mnemonic, index = 0 }: CreateAccountParamsMnemonic) {
    const cosmosWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "init",
      hdPaths: [stringToPath(`m/44'/118'/0'/0/${index}`)],
    })

    const { address: ethereumAddress } = HDNodeWallet.fromPhrase(mnemonic, undefined, `m/44'/60'/0'/0/${index}`)
    const [{ address: initiaAddress, pubkey }] = await cosmosWallet.getAccounts()
    const publicKey = encodeSecp256k1Pubkey(pubkey)
    await accountsController.addAccount({ type: "mnemonic", name: "", initiaAddress, ethereumAddress, publicKey })
    await vaultController.addKey(initiaAddress, { mnemonic, index })
  }

  static async addAccountFromPrivateKey({ privateKey, payload }: CreateAccountParamsPrivateKey) {
    const cosmosWallet = await DirectSecp256k1Wallet.fromKey(Buffer.from(privateKey, "hex"), "init")
    const { address: ethereumAddress } = new Wallet(privateKey)
    const [{ address: initiaAddress, pubkey }] = await cosmosWallet.getAccounts()
    const publicKey = encodeSecp256k1Pubkey(pubkey)
    await accountsController.addAccount({
      type: "privateKey",
      name: "",
      initiaAddress,
      ethereumAddress,
      publicKey,
      payload,
    })
    await vaultController.addKey(initiaAddress, { privateKey })
  }

  static async deleteAccount(address: string) {
    await vaultController.deleteKey(address)
    await accountsController.deleteAccount(address)
  }
}

export default KeyringController
