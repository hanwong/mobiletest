import type { TxBodyValue } from "@initia/utils"
import { AsyncLocalStorage, defined, TxBodyValueSchema, createRegistry, required } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import type { Msg } from "@initia/initia.js"
import { STORAGE_KEYS } from "../shared/constants"
import { WalletNames, type Wallet } from "../shared/wallets"
import InitiaSigner from "../signers/initia/InitiaSigner"
import InitiaMobileSigner from "../signers/initia/InitiaMobileSigner"
import InitiaWebViewSigner from "../signers/initia/InitiaWebViewSigner"
import KeplrSigner from "../signers/keplr/KeplrSigner"
import EthereumSigner from "../signers/ethereum/EthereumSigner"
import Web3AuthSigner from "../signers/web3auth/Web3AuthSigner"
import Web3AuthConnector from "../signers/web3auth/Web3AuthConnector"
import LedgerSigner from "../signers/ledger/LedgerSigner"
import { address$, opened$, signer$, wallet$ } from "./state"
import { layer, useWalletAsSignerOnly, web3authClientId } from "./config"

export function openWalletList() {
  opened$.next({ component: "WalletList" })
}

export function viewConnectedWallet(event?: MouseEvent) {
  const offset = 16 // TODO: move to config

  event?.stopPropagation()

  if (opened$.value?.component === "ConnectedWallet") {
    opened$.next(null)
    return
  }

  let style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999" // TODO: move to config

  if (event?.currentTarget && event.currentTarget instanceof HTMLElement) {
    const rect = event.currentTarget.getBoundingClientRect()
    const top = rect.top + window.scrollY + rect.height + offset
    const right = document.documentElement.clientWidth - rect.right
    const screenWidth = document.documentElement.clientWidth

    if (right + 375 < screenWidth) style = `position: absolute; top: ${top}px; right: ${right}px; z-index: 9999` // TODO: move to config
  }

  opened$.next({ component: "ConnectedWallet", style })
}

export function close() {
  opened$.next(null)
}

export async function requestInitiaTx({ msgs, memo }: { msgs: Msg[]; memo?: string }, gas?: number): Promise<string> {
  const messages = msgs.map((msg) => ({ typeUrl: msg.packAny().typeUrl, value: msg.toProto() }))
  return requestTx({ messages, memo }, gas)
}

export async function requestTx(txBodyValue: TxBodyValue, gas?: number): Promise<string> {
  if (!TxBodyValueSchema.safeParse(txBodyValue).success) {
    throw new Error("Tx is invalid")
  }

  const walletName = wallet$.value?.name

  const isInitia = walletName === WalletNames.Initia || walletName === WalletNames.InitiaMobile
  const isWebView = walletName === WalletNames.InitiaWebView

  function transformErrorMessage(error: unknown) {
    if (!(error instanceof Error)) return error

    if (error.message.includes("tx already exists in cache")) {
      return new Error("Previous transaction already requested and in processing. Try again in a few minutes.")
    }

    if (error.message.includes("pool reached max tx capacity")) {
      return new Error("Too many transactions. Try again in a few minutes.")
    }

    if (error.message.includes("account sequence mismatch")) {
      return new Error("Your previous transaction is still processing. Try again in a few minutes.")
    }

    return error
  }

  if (!useWalletAsSignerOnly && isInitia && !gas) {
    try {
      const signer = signer$.value as InitiaSigner
      const registry = createRegistry()
      await signer.requestAddInitiaLayer(layer)
      const transactionHash = await signer.signAndBroadcastSync(layer.chain_id, registry.encodeTxBody(txBodyValue))
      await signer.pollTx(transactionHash)
      return transactionHash
    } catch (error) {
      throw transformErrorMessage(error)
    }
  }

  return new Promise((resolve, reject) => {
    opened$.next({
      component: "RequestTx",
      requested: {
        layer,
        txBodyValue,
        gas,
        skipPollingTx: isWebView,
        resolve: (transactionHash: string) => {
          if (isWebView) {
            window.initiaWebView?.emit?.("txConfirmed", transactionHash)
          }

          resolve(transactionHash)
          close()
        },
        reject: (e: Error) => {
          const error = transformErrorMessage(e)

          if (isWebView) {
            window.initiaWebView?.emit?.("txFailed", error)
          }

          reject(error)
          close()
        },
      },
    })
  })
}

export async function signArbitrary(data: string | Uint8Array): Promise<string> {
  return required(signer$.value).signArbitrary(data)
}

export async function verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean> {
  return required(signer$.value).verifyArbitrary(data, signature)
}

export async function getSigner({ name, loginProvider }: Wallet, chain: Chain, useExistingProvider: boolean = false) {
  switch (name) {
    case WalletNames.Initia:
      return new InitiaSigner(chain)

    case WalletNames.InitiaWebView:
      return new InitiaWebViewSigner(chain)

    case WalletNames.InitiaMobile: {
      const signer = new InitiaMobileSigner(chain)
      await signer.init()
      return signer
    }

    case WalletNames.Keplr:
      if (!window.keplr) throw new Error("Keplr not installed")
      return new KeplrSigner(chain, window.keplr)

    case WalletNames.Leap:
      if (!window.leap) throw new Error("Leap not installed")
      return new KeplrSigner(chain, window.leap)

    case WalletNames.MetaMask:
    case WalletNames.Rabby:
    case WalletNames.Phantom:
      return new EthereumSigner(chain, window.ethereum)

    case WalletNames.Web3Auth: {
      const web3authConnector = new Web3AuthConnector(web3authClientId)
      await web3authConnector.init()
      if (!loginProvider) throw new Error("Login provider not provided")
      const ethereum = useExistingProvider
        ? web3authConnector.provider
        : await web3authConnector.connectTo(loginProvider.value)
      defined(ethereum)
      return new Web3AuthSigner(chain, ethereum, web3authConnector)
    }

    case WalletNames.Ledger:
      return new LedgerSigner(chain)

    default:
      throw new Error("Unsupported wallet")
  }
}

export async function connect(wallet: Wallet, connectingLastWallet: boolean = false) {
  if (wallet && wallet.getShouldDownload?.() && wallet.chromeWebStoreURL) {
    window.open(wallet.chromeWebStoreURL, "_blank")
    return
  }

  const signer = await getSigner(wallet, layer, connectingLastWallet)
  const address = await signer.connect()
  close()
  signer$.next(signer)
  wallet$.next(wallet)
  address$.next(address)
  await AsyncLocalStorage.setItem(STORAGE_KEYS.LAST_CONNECTED_WALLET, wallet)
}

export async function disconnect() {
  await signer$.value?.disconnect()
  close()
  signer$.next(null)
  wallet$.next(null)
  address$.next("")
  await AsyncLocalStorage.removeItem(STORAGE_KEYS.LAST_CONNECTED_WALLET)
}
