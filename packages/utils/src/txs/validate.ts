import BigNumber from "bignumber.js"
import { toAmount, toQuantity } from "../common"

export function validateQuantityInput({ balance = "0", decimals = 6 }) {
  return {
    insufficient: () => {
      if (BigNumber(balance).isZero()) return "Insufficient balance"
    },
    decimal: (value: string) => {
      const [, decimal] = value.split(".")
      if (decimal?.length > decimals) return `Amount must be within ${decimals} decimal points`
    },
    range: (value: string) => {
      const amount = toAmount(value, decimals)
      const valid = BigNumber(amount).gt(0) && BigNumber(amount).lte(balance)
      if (!valid) return `Amount must be between 0 and ${toQuantity(balance, decimals)}`
    },
  }
}

export function validateSlippage(value: string) {
  if (BigNumber(value).isNaN()) return { type: "error" as const, message: "Slippage must be greater than 0" }
  if (BigNumber(value).lt(0)) return { type: "error" as const, message: "Slippage must be greater than 0" }
  if (BigNumber(value).gt(50)) return { type: "error" as const, message: "Slippage must be less than 50" }
  if (BigNumber(value).lt(0.5)) return { type: "warning" as const, message: "Transaction may fail" }
  if (BigNumber(value).gt(1)) return { type: "warning" as const, message: "Transaction may be frontrun" }
  return { type: "success" as const, message: "" }
}
