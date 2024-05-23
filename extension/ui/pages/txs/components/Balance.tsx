import type { PropsWithChildren } from "react"
import { Group, Text } from "@mantine/core"
import { formatAmount } from "@initia/utils"

export interface Props {
  amount: string
  decimals: number
}

const Balance = ({ amount, decimals, children }: PropsWithChildren<Props>) => {
  return (
    <Group spacing={6} c="mono.2" fz={12} fw={700}>
      {children}
      <Text td="underline">{formatAmount(amount, { decimals })}</Text>
    </Group>
  )
}

export default Balance
