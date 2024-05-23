import { useCallback, useContext, useSyncExternalStore } from "react"
import type { BehaviorSubject } from "rxjs"
import type { Eip1193Provider } from "ethers"
import type { Msg } from "@initia/initia.js"
import type { Wallet } from "@initia/wallet-widget"
import context from "./context"

interface ReactWalletWidget {
  /** Current wallet address. */
  address: string

  /** Current connected wallet. */
  wallet: Wallet | null

  /** Current connected Ethereum provider. */
  ethereum: Eip1193Provider | null

  /** Loading state: true on auto-reconnect at start, then false. */
  isLoading: boolean

  /** Opens a modal for wallet connection (e.g., Keplr, Metamask). */
  onboard(): void

  /** Shows a popover for the connected wallet to manage assets. */
  view(event: React.MouseEvent): void

  /** Disconnects the wallet. */
  disconnect(): Promise<void>

  /** Signs arbitrary data with the wallet. Returns the signature. */
  signArbitrary(data: string | Uint8Array): Promise<string>

  /** Checks the signature against the data. Returns true if valid. */
  verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean>

  /** Signs and broadcasts a transaction. Returns transaction hash. */
  requestTx(
    txBodyValue: { messages: { typeUrl: string; value: Record<string, any> }[]; memo?: string },
    gas?: number,
  ): Promise<string>

  /** Signs and broadcasts a transaction using the @initia/initia.js library. Returns transaction hash. */
  requestInitiaTx(tx: { msgs: Msg[]; memo?: string }, gas?: number): Promise<string>
}

export function useWallet(): ReactWalletWidget {
  const {
    onboard,
    view: _view,
    requestTx,
    requestInitiaTx,
    signArbitrary,
    verifyArbitrary,
    disconnect,
    address$,
    wallet$,
    ethereum$,
    isLoading$,
  } = useContext(context)

  const view = useCallback(
    (event?: React.MouseEvent) => {
      _view(event as MouseEvent | undefined)
    },
    [_view],
  )

  const address = useObservableSync(address$)
  const wallet = useObservableSync(wallet$)
  const ethereum = useObservableSync(ethereum$)
  const isLoading = useObservableSync(isLoading$)

  return {
    onboard,
    view,
    requestTx,
    requestInitiaTx,
    signArbitrary,
    verifyArbitrary,
    disconnect,
    address,
    wallet,
    ethereum,
    isLoading,
  }
}

export function useAddress() {
  const { address } = useWallet()
  return address
}

function useObservableSync<T>(observable: BehaviorSubject<T>) {
  const getSnapshot = () => observable.getValue()

  const subscribe = (handleChange: () => void) => {
    const subscription = observable.subscribe(handleChange)
    return () => subscription.unsubscribe()
  }

  return useSyncExternalStore(subscribe, getSnapshot)
}
