import type { ReactNode } from "react"
import { Box, Flex } from "@mantine/core"

const FullHeightFlex = ({ header, footer }: { header: ReactNode; footer: ReactNode }) => {
  return (
    <Flex direction="column" h="100vh" p={30}>
      <Flex direction="column" justify="center" sx={{ flex: 1 }}>
        {header}
      </Flex>

      <Box sx={{ flex: "none" }}>{footer}</Box>
    </Flex>
  )
}

export default FullHeightFlex
