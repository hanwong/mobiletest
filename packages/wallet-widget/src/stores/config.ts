import type { Chain } from "@initia/initia-registry-types"
import {
  DEFAULT_MODULES,
  DEFAULT_MULTIPLIER,
  DEFAULT_OMNITIA_URL,
  DEFAULT_SWAPLIST_URL,
  WEB3AUTH_CLIENT_ID,
  WALLETCONNECT_PROJECT_ID,
} from "../shared/constants"

interface ChainExtraInfo {
  omnitia: string
  assetlist: string
  swaplist: string

  modules: {
    usernames: string
    dex_utils: string
    swap_transfer: string
  }
}

interface Extra extends ChainExtraInfo {
  multiplier: number
  web3authClientId: string
  wcProjectId: string

  useWalletAsSignerOnly: boolean
  ethereumWalletsOnly: boolean
}

export interface Config extends Partial<Extra> {
  layer: Chain
}

export let layer: Chain

export let omnitiaURL = DEFAULT_OMNITIA_URL
export let swaplistURL = DEFAULT_SWAPLIST_URL
export let modules = DEFAULT_MODULES

export let multiplier = DEFAULT_MULTIPLIER
export let web3authClientId = WEB3AUTH_CLIENT_ID
export let wcProjectId = WALLETCONNECT_PROJECT_ID

export let useWalletAsSignerOnly = false
export let ethereumWalletsOnly = false

export function updateConfig(config: Config) {
  layer = config.layer

  if (config.omnitia) omnitiaURL = config.omnitia
  if (config.swaplist) swaplistURL = config.swaplist
  if (config.modules) modules = config.modules

  if (config.multiplier) multiplier = config.multiplier
  if (config.web3authClientId) web3authClientId = config.web3authClientId
  if (config.wcProjectId) wcProjectId = config.wcProjectId

  if (config.useWalletAsSignerOnly) useWalletAsSignerOnly = config.useWalletAsSignerOnly
  if (config.ethereumWalletsOnly) ethereumWalletsOnly = config.ethereumWalletsOnly
}
