import type { PropsWithChildren } from "react"
import type { GroupProps } from "@mantine/core"
import { Box, Flex, Text, useMantineTheme } from "@mantine/core"
import Icon from "../../../styles/Icon"

interface Props extends GroupProps {
  info?: boolean
  warning?: boolean
}

const FormError = ({ info, warning, children, ...other }: PropsWithChildren<Props>) => {
  const theme = useMantineTheme()
  const color = info ? "info" : warning ? "warning" : "danger"

  return (
    <Box c={theme.other[color]} pos="relative" pl={24} {...other}>
      <Flex h={14 * Number(theme.lineHeight)} align="center" pos="absolute" top={0} left={0}>
        <Icon.Warning />
      </Flex>

      <Text>{children}</Text>
    </Box>
  )
}

export default FormError
