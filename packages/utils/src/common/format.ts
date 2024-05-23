import BigNumber from "bignumber.js"
import numeral from "numeral"
import { isNil, pickBy } from "ramda"

const ROUNDING_MODE = BigNumber.ROUND_DOWN

export interface FormatConfig {
  decimals: number
  fixed: number | false
  comma: boolean
  integer: boolean
  suffix: boolean
}

const DefaultConfig: FormatConfig = {
  decimals: 6,
  fixed: false,
  comma: true,
  integer: false,
  suffix: false,
}

function getConfig(config: Partial<FormatConfig> = {}): FormatConfig {
  return Object.assign(
    {},
    DefaultConfig,
    pickBy((value) => !isNil(value), config),
  )
}

/* decimals */
export function formatNumber(value?: BigNumber.Value, config?: Partial<FormatConfig>) {
  if (!value || BigNumber(value).isNaN()) return "0"
  const { decimals, comma, integer, fixed, suffix } = getConfig(config)
  const dp = typeof fixed === "number" ? fixed : decimals
  const n = new BigNumber(value).dp(integer ? 0 : dp, ROUNDING_MODE)
  const d = Array.from({ length: dp }, () => "0").join("")
  const i = [comma ? "0,0" : "0", fixed ? d : `[${d}]`].join(".")
  const fmt = !suffix ? i : integer ? "0a" : fixed === 1 ? "0.0a" : "0.00a"
  return n.lt(1e-6) ? n.toString(10) : numeral(n).format(fmt).toUpperCase()
}

/* amount */
export function formatAmount(value?: BigNumber.Value, config?: Partial<FormatConfig>) {
  if (!value || BigNumber(value).isNaN()) return "0"
  const { decimals } = getConfig(config)
  return formatNumber(new BigNumber(value).div(new BigNumber(10).pow(decimals)), config)
}

export function toAmount(value?: BigNumber.Value, decimals = 6) {
  if (!value || BigNumber(value).isNaN()) return "0"
  return new BigNumber(value).times(new BigNumber(10).pow(decimals)).integerValue().toString()
}

export function toQuantity(value?: BigNumber.Value, decimals = 6) {
  if (!value || BigNumber(value).isNaN()) return "0"
  return new BigNumber(value).integerValue().div(new BigNumber(10).pow(decimals)).toString()
}

/* percent */
export function formatPercent(value?: BigNumber.Value, fixed: number | false = 2) {
  if (!value || BigNumber(value).isNaN()) return "0%"
  const n = new BigNumber(value).times(100)
  return (typeof fixed === "number" ? n.toFixed(fixed) : n.toLocaleString()) + "%"
}
