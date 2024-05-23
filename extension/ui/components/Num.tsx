import BigNumber from "bignumber.js"
import type { DefaultProps, Selectors } from "@mantine/core"
import { createStyles, Box, Text } from "@mantine/core"
import type { FormatConfig } from "@initia/utils"
import { formatAmount } from "@initia/utils"

export interface NumStylesParams {
  tnum?: boolean
  size?: string | number
  decimalSize?: string | number
  symbolSize?: string | number
}

const useStyles = createStyles((_, { tnum, size, decimalSize = size, symbolSize = decimalSize }: NumStylesParams) => {
  return {
    root: { fontFeatureSettings: tnum ? '"tnum"' : undefined },
    integer: { fontSize: size },
    decimal: { fontSize: decimalSize },
    symbol: { fontSize: symbolSize },
  }
})

type NumStylesNames = Selectors<typeof useStyles>

interface NumProps extends Partial<FormatConfig>, NumStylesParams, DefaultProps<NumStylesNames, NumStylesParams> {
  fullWidth?: boolean

  amount?: string | number
  denom?: string
  symbol?: string
  prefix?: string
  almost?: boolean
  fixedByAmount?: boolean
}

const Num = ({
  classNames,
  styles,
  unstyled,
  className,

  tnum,
  size,
  decimalSize,
  symbolSize,
  fullWidth,

  amount,
  symbol,
  prefix,
  almost,
  fixedByAmount,

  comma,
  fixed,
  suffix,
  integer,
  decimals,

  ...others
}: NumProps) => {
  const { classes, cx } = useStyles(
    { tnum, size, decimalSize, symbolSize },
    { name: "Num", classNames, styles, unstyled },
  )

  if (!validateAmount(amount)) return null

  const config = {
    comma,
    suffix,
    integer,
    decimals,
    fixed: !fixedByAmount ? fixed : getFixedByAmount(decimals, amount),
  }

  const [int, dec] = formatAmount(amount, config).split(".")

  const decimalElement = !dec ? null : `.${dec}`
  const symbolElement = !symbol ? null : ` ${symbol}`

  const element = (
    <>
      <Text className={classes.integer} span inherit {...others}>
        {almost ? "≈ " : ""}
        {prefix}
        {int}
      </Text>

      <Text className={classes.decimal} span inherit {...others}>
        {decimalElement}
      </Text>

      <Text className={classes.symbol} span inherit {...others}>
        {symbolElement}
      </Text>
    </>
  )

  return (
    <Box component={fullWidth ? "div" : "span"} className={cx(classes.root, className)}>
      {element}
    </Box>
  )
}

export default Num

function validateAmount(amount: unknown): amount is string | number {
  if (typeof amount === "string" || typeof amount === "number") return BigNumber(amount).isFinite()
  return false
}

function getFixedByAmount(decimals = 6, amount: string | number) {
  if (BigNumber(amount).lt(BigNumber(10).pow((decimals ?? 6) + 3))) return 2 // n > 1000
  return 0
}
