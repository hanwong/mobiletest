import { useQuery } from "@tanstack/react-query"
import { Box, Group, Image, Stack, Text, UnstyledButton } from "@mantine/core"
import { StargateClientCache } from "@initia/utils"
import { defaultChain } from "../../../../scripts/shared/chains"
import HomeHeader from "../components/HomeHeader"
import FullHeight from "../components/FullHeight"

const ChainId = ({ rpc }: { rpc: string }) => {
  const { data: chainId } = useQuery({
    queryKey: ["chainId", rpc],
    queryFn: async () => {
      const client = await StargateClientCache.connect(rpc)
      return client.getChainId()
    },
  })

  if (!chainId) return null

  return <Text span> ({chainId})</Text>
}

const Chains = () => {
  const chains = [defaultChain]
  const selectedChain = defaultChain

  return (
    <FullHeight>
      <HomeHeader />

      <Box px={20}>
        <Text mt={52} mb={28}>
          Select a network to switch to
          <br />a different blockchain.
        </Text>

        <Stack spacing={8}>
          {chains.map((chain) => {
            const { chainId, displayName } = chain
            const isConnected = chainId === selectedChain.chainId

            return (
              <UnstyledButton
                bg="mono.6"
                px={20}
                py={16}
                sx={({ fn }) => ({
                  border: `1px solid ${fn.themeColor(isConnected ? "mono.1" : "mono.6")}`,
                  borderRadius: 20,
                  color: fn.themeColor(isConnected ? "mono.0" : "mono.1"),
                  ...fn.hover({
                    borderColor: fn.themeColor(isConnected ? "mono.1" : "mono.5"),
                  }),
                })}
                key={chainId}
              >
                <Group spacing={8}>
                  <Image src={chain.logo} width={28} height={28} />

                  <Text fz={12} fw={600}>
                    {displayName}
                    <ChainId {...chain} />
                  </Text>
                </Group>
              </UnstyledButton>
            )
          })}
        </Stack>
      </Box>
    </FullHeight>
  )
}

export default Chains
