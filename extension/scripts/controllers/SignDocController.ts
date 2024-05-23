import type { DirectSignResponse } from "@cosmjs/proto-signing"
import type { DirectSignArgs } from "../types"
import { closePopup, openPopup } from "../utils/popup"
import { vaultController } from "../data/controllers"

interface Requested extends DirectSignArgs {
  url?: string
  approve: () => Promise<void>
  reject: () => Promise<void>
}

class SignDocController {
  #requested: Requested | undefined

  get requested() {
    if (!this.#requested) return undefined
    const { approve, reject, ...rest } = this.#requested
    return rest
  }

  request(args: DirectSignArgs, url?: string) {
    const { signerAddress, signDoc } = args
    return new Promise<DirectSignResponse>(async (resolve, reject) => {
      this.#requested = {
        ...args,
        url,
        approve: async () => {
          this.#requested = undefined
          const wallet = await vaultController.getCosmosWallet()
          try {
            const response = await wallet.signDirect(signerAddress, signDoc)
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

export default SignDocController
