import { Link } from "react-router-dom"
import BigNumber from "bignumber.js"
import { Box, Button, Collapse, Group, Text } from "@mantine/core"
import { truncate } from "@initia/utils"
import type { BaseAssetInfo } from "../../../data/tokens"
import Num from "../../../components/Num"
import TokenLogo from "../../../components/TokenLogo"

interface Props extends BaseAssetInfo {
  search?: Record<string, string>
  isFocused?: boolean
}

const AssetItem = ({ image, symbol, name, decimals, balance, value = 0, search, isFocused }: Props) => {
  return (
    <Box px={20} py={20}>
      <Group spacing={10} position="apart" noWrap>
        <Box sx={{ flex: "none" }}>
          <TokenLogo image={image} size={26} />
        </Box>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Text c="mono.0" fz={14} fw={700} title={symbol} truncate>
            {truncate(symbol)}
          </Text>

          {name && (
            <Text c="mono.4" fz={10} fw={700} truncate>
              {name}
            </Text>
          )}
        </Box>

        <Box ta="right" sx={{ flex: "none" }}>
          <Text c="mono.0" fz={14} fw={700}>
            <Num amount={balance} decimals={decimals} fixed={6} decimalSize={11} fullWidth />
          </Text>

          {BigNumber(value).gt(0) && (
            <Text c="mono.4" fz={11} fw={600}>
              <Num amount={value} prefix="$" decimals={0} fixedByAmount />
            </Text>
          )}
        </Box>
      </Group>

      <Collapse in={!!isFocused}>
        <Group spacing="xs" grow pt={16}>
          {[
            { to: "/send", label: "Send" },
            { to: "/swap", label: "Swap" },
          ].map(({ to, label }) => (
            <Button
              variant="small"
              component={Link}
              to={{ pathname: to, search: new URLSearchParams(search).toString() }}
              key={to}
            >
              {label}
            </Button>
          ))}
        </Group>
      </Collapse>
    </Box>
  )
}

export default AssetItem
