import { isNil } from "ramda"
import type { Preferences } from "../types"
import storage from "../storage"
import { vaultController } from "../data/controllers"

const MINUTE = 60 * 1000

const STORAGE_KEY = "Preferences"

class PreferencesController {
  #preferences: Preferences = {}

  constructor() {
    this.init()
  }

  private async init() {
    this.#preferences = (await storage.get<Preferences>(STORAGE_KEY)) ?? {}
  }

  get preferences() {
    return this.#preferences
  }

  /* auto-lock */
  private timer: NodeJS.Timeout | null = null
  private resetTimer(timeoutMinutes: number) {
    if (this.timer) clearTimeout(this.timer)
    if (!timeoutMinutes) return
    this.timer = setTimeout(() => vaultController.lock(), timeoutMinutes * MINUTE)
  }

  async set(params: Partial<Preferences>) {
    for (const [key, value] of Object.entries(params)) {
      if (isNil(value) || Number.isNaN(value)) delete this.#preferences[key as keyof Preferences]
      else this.#preferences[key as keyof Preferences] = value

      switch (key) {
        case "timeoutMinutes":
          this.resetTimer(value)
      }
    }

    await storage.set(STORAGE_KEY, this.preferences)
  }
}

export default PreferencesController
