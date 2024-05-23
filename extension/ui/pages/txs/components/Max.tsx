import { createPolymorphicComponent, Text, UnstyledButton } from "@mantine/core"
import type { Props } from "./Balance"
import Balance from "./Balance"

const _Max = ({ amount, decimals, ...props }: Props) => {
  return (
    <UnstyledButton {...props}>
      <Balance amount={amount} decimals={decimals}>
        <Text c="mono.6">Available</Text>
      </Balance>
    </UnstyledButton>
  )
}

const Max = createPolymorphicComponent<"button", Props>(_Max)

export default Max
