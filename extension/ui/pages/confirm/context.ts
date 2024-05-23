import { createContext } from "@initia/react-components"
import type { UseQueryResult } from "@tanstack/react-query"
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin"
import type { DeliverTxResponse, StdFee } from "@cosmjs/stargate"
import type { Sender } from "../../../scripts/types"

interface ConfirmTxContext {
  sender?: Sender
  chainId: string
  txBody: Uint8Array
  skipGasSimulation?: boolean
  approve: (fee?: StdFee) => Promise<DeliverTxResponse | void>
  reject: () => void
}

export const [useTxConfirmContext, ConfirmTxContextProvider] = createContext<ConfirmTxContext>("ConfirmTxContext")

export interface FeeContext {
  gasSimulation: UseQueryResult
  fee: Partial<Coin>
  isEnough?: boolean
}
