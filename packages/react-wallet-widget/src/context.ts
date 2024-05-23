import type { Context } from "react"
import { createContext } from "react"
import type { WalletWidget } from "@initia/wallet-widget"

const context: Context<WalletWidget> = createContext<WalletWidget>(null!)

export default context
