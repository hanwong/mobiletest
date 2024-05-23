import * as secp256k1 from "secp256k1"
import { sha256 } from "@noble/hashes/sha256"
import { fromBase64 } from "@cosmjs/encoding"
import { Data } from "@initia/utils"
import type { Sender } from "../types"
import { closePopup, openPopup } from "../utils/popup"
import { accountsController, vaultController } from "../data/controllers"

interface Requested {
  data: string | Uint8Array
  sender?: Sender
  approve: () => Promise<void>
  reject: () => Promise<void>
}

class ArbitraryController {
  #requested: Requested | undefined

  get requested() {
    if (!this.#requested) return undefined
    const { approve, reject, ...rest } = this.#requested
    return rest
  }

  private signArbitrary(data: string | Uint8Array, privateKey: Buffer) {
    const msgHash = sha256(data)
    const { signature } = secp256k1.ecdsaSign(msgHash, privateKey)
    return new Data(signature).base64
  }

  private verifyArbitrary(data: string | Uint8Array, sig: string, publicKey: Uint8Array) {
    const msgHash = sha256(data)
    const signature = new Data(sig).buffer
    return secp256k1.ecdsaVerify(signature, msgHash, publicKey)
  }

  verify({ data, sig }: { data: string | Uint8Array; sig: string }) {
    const account = accountsController.account
    if (!account) return false
    const pubkey = new Uint8Array(fromBase64(account.publicKey.value))
    return this.verifyArbitrary(data, sig, pubkey)
  }

  request(data: string | Uint8Array, sender?: Sender) {
    return new Promise<string>(async (resolve, reject) => {
      this.#requested = {
        data,
        sender,
        approve: async () => {
          this.#requested = undefined
          try {
            const privateKey = await vaultController.getPrivateKey()
            const response = this.signArbitrary(data, new Data(privateKey).buffer)
            resolve(response)
          } catch (error) {
            reject(error)
          }

          await closePopup()
        },
        reject: async () => {
          this.#requested = undefined
          reject(new Error("User rejected"))
          await closePopup()
        },
      }

      await openPopup()
    })
  }

  async approve() {
    await this.#requested?.approve()
  }

  async reject() {
    await this.#requested?.reject()
  }
}

export default ArbitraryController
