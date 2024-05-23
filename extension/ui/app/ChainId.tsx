import { useMemo } from "react"
import { Box } from "@mantine/core"
import { defaultChain } from "../../scripts/shared/chains"

const ChainId = () => {
  const { chainId } = defaultChain

  const bg = useMemo(() => {
    if (chainId.startsWith("mahalo")) return "blue.9"
    if (chainId.startsWith("stone")) return "orange.9"
  }, [chainId])

  if (!bg) return null

  return (
    <Box bg={bg} fw="bold" py={4} ta="center">
      {chainId}
    </Box>
  )
}

export default ChainId
