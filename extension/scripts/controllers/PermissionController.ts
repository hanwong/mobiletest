import type { Authorized, Sender } from "../types"
import storage from "../storage"
import { closePopup, openPopup } from "../utils/popup"

interface Requested {
  sender: Sender
  approve: () => Promise<void>
  reject: () => Promise<void>
}

const STORAGE_KEY = "Permission"

class PermissionController {
  #requested: Requested | undefined
  #authorized: Authorized = {}

  constructor() {
    this.init()
  }

  private async init() {
    this.#authorized = (await storage.get<Authorized>(STORAGE_KEY)) ?? {}
  }

  get requested() {
    return this.#requested?.sender
  }

  get authorized() {
    return this.#authorized
  }

  getIsAuthorized(url: string) {
    if (url.endsWith(".initia.xyz")) return true
    return !!this.authorized[url]
  }

  request(sender: Sender) {
    const { url } = sender
    if (this.getIsAuthorized(url)) return true
    return new Promise<void>(async (resolve, reject) => {
      this.#requested = {
        sender,
        approve: async () => {
          this.#authorized[url] = sender
          this.#requested = undefined
          resolve()
          await storage.set(STORAGE_KEY, this.authorized)
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

  async forget(url: string) {
    delete this.#authorized[url]
    await storage.set(STORAGE_KEY, this.authorized)
  }
}

export default PermissionController
