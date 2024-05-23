import type { PropsWithChildren, ReactNode } from "react"
import { Box, Flex } from "@mantine/core"

const FullHeight = ({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) => {
  return (
    <Flex direction="column" h="100vh" bg="mono.7">
      <Flex direction="column" sx={{ flex: 1 }}>
        {children}
      </Flex>

      {footer && <Box sx={{ flex: "none" }}>{footer}</Box>}
    </Flex>
  )
}

export default FullHeight
