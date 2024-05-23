import { AsyncLocalStorage } from "@initia/utils"
import { ChainSchema } from "@initia/initia-registry-types/zod"
import { STORAGE_KEYS } from "./shared/constants"
import { WalletNames, type Wallet } from "./shared/wallets"
import {
  connect,
  disconnect,
  openWalletList,
  requestTx,
  requestInitiaTx,
  signArbitrary,
  verifyArbitrary,
  viewConnectedWallet,
} from "./stores/actions"
import { type Config, updateConfig } from "./stores/config"
import { address$, isLoading$, wallet$, ethereum$ } from "./stores/state"
import Fonts from "./ui/styles/Fonts"
import Widget from "./ui/Widget.svelte"

export type { Config } from "./stores/config"
export type { Wallet } from "./shared/wallets"

const widget = {
  address$,
  wallet$,
  ethereum$,
  isLoading$,
  onboard: openWalletList,
  view: viewConnectedWallet,
  requestTx,
  requestInitiaTx,
  signArbitrary,
  verifyArbitrary,
  disconnect,
}

export type WalletWidget = typeof widget

function importFonts() {
  const styleEl = document.createElement("style")
  styleEl.innerHTML = Fonts
  document.body.appendChild(styleEl)
}

function mountApp() {
  importFonts()

  const containerElement = document.querySelector("body")
  if (!containerElement) throw new Error("No container element found")

  if (containerElement.querySelector("initia-onboard")) return

  const onboardElement = document.createElement("initia-onboard")
  onboardElement.style.all = "initial"
  containerElement.appendChild(onboardElement)

  const shadowRoot = onboardElement.attachShadow({ mode: "open" })
  new Widget({ target: shadowRoot })
}

async function connectLastWallet() {
  try {
    const lastConnectedWallet = await AsyncLocalStorage.getItem<Wallet>(STORAGE_KEYS.LAST_CONNECTED_WALLET)
    if (lastConnectedWallet) await connect(lastConnectedWallet, true)
  } catch (error) {
    await AsyncLocalStorage.removeItem(STORAGE_KEYS.LAST_CONNECTED_WALLET)
  } finally {
    isLoading$.next(false)
  }
}

function init(config: Config) {
  const parsed = ChainSchema.safeParse(config.layer)

  if (!parsed.success) {
    console.groupCollapsed("Wallet Widget: Invalid layer")
    console.warn(parsed.error)
    console.groupEnd()
  }

  updateConfig(config)

  if (window.initiaWebView) {
    connect({ name: WalletNames.InitiaWebView })
  } else {
    connectLastWallet()
  }

  mountApp()

  return widget
}

export default init
