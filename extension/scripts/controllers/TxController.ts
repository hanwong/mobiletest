import type { StdFee } from "@cosmjs/stargate"
import type { Sender, SignAndBroadcastArgs } from "../types"
import { closePopup, openPopup } from "../utils/popup"
import { vaultController } from "../data/controllers"

interface Requested extends SignAndBroadcastArgs {
  sender?: Sender
  approve: (fee: StdFee) => Promise<void>
  reject: () => Promise<void>
}

class TxController {
  #requested: Requested | undefined

  get requested() {
    if (!this.#requested) return undefined
    const { approve, reject, ...rest } = this.#requested
    return rest
  }

  private requestWith<T>(callback: (fee: StdFee) => Promise<T>, args: SignAndBroadcastArgs, sender?: Sender) {
    return new Promise<T>(async (resolve, reject) => {
      this.#requested = {
        ...args,
        sender,
        approve: async (fee: StdFee) => {
          this.#requested = undefined
          try {
            const response = (await callback(fee)) as T
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

  request(args: SignAndBroadcastArgs, sender?: Sender, mode: "sync" | "block" = "block") {
    switch (mode) {
      case "sync":
        return this.requestWith(
          (fee: StdFee) => vaultController.signAndBroadcastCosmosTxSync({ ...args, fee }),
          args,
          sender,
        )

      case "block":
        return this.requestWith(
          (fee: StdFee) => vaultController.signAndBroadcastCosmosTxBlock({ ...args, fee }),
          args,
          sender,
        )
    }
  }

  async approve(fee: StdFee) {
    await this.#requested?.approve(fee)
  }

  async reject() {
    await this.#requested?.reject()
  }
}

export default TxController
