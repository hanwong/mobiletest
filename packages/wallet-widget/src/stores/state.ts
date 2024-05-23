import { BehaviorSubject } from "rxjs"
import type { Eip1193Provider } from "ethers"
import type { TxBodyValue } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import type { Wallet } from "../shared/wallets"
import type BaseSigner from "../signers/base/BaseSigner"
import EthereumSigner from "../signers/ethereum/EthereumSigner"

export const address$ = new BehaviorSubject<string>("")
export const wallet$ = new BehaviorSubject<Wallet | null>(null)
export const signer$ = new BehaviorSubject<BaseSigner | null>(null)

export const ethereum$ = new BehaviorSubject<Eip1193Provider | null>(null)

signer$.subscribe((signer) => {
  if (signer instanceof EthereumSigner) {
    ethereum$.next(signer.ethereum)
  } else {
    ethereum$.next(null)
  }
})

interface Requested {
  layer: Chain
  txBodyValue: TxBodyValue
  gas: number | undefined
  skipPollingTx: boolean
  resolve: (value: string) => void
  reject: (error: Error) => void
}

type Opened =
  | { component: "WalletList" }
  | { component: "ConnectedWallet"; style: string }
  | { component: "RequestTx"; requested: Requested }

export const opened$ = new BehaviorSubject<Opened | null>(null)
export const isLoading$ = new BehaviorSubject<boolean>(true)
