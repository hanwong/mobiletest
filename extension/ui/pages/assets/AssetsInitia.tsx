import { descend, sortWith } from "ramda"
import { Accordion, Alert, Box, Group, Image, Stack, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import type { Chain } from "@initia/initia-registry-types"
import { ChainSchema } from "@initia/initia-registry-types/zod"
import { ErrorBoundary } from "@initia/react-components"
import { useAddress, useLayers } from "../../background"
import { useGetLayerValue } from "./data/values"
import AssetsInitiaLayer from "./AssetsInitiaLayer"

const AssetsInitia = () => {
  const layers = useLayers()
  const address = useAddress()
  const getLayerValue = useGetLayerValue(address)
  const sortedLayers = sortWith<Chain>([
    descend(({ metadata }) => metadata?.is_l1 ?? false),
    descend(({ chain_name }) => getLayerValue(chain_name)),
  ])(layers)
  const defaultLayer = layers.find(({ metadata }) => metadata?.is_l1)?.chain_id
  const [value, setValue] = useLocalStorage({
    key: "OpenedLayersAssets",
    defaultValue: defaultLayer ? [defaultLayer] : undefined,
    getInitialValueInEffect: false,
  })

  return (
    <Stack>
      <Box px={20}>
        {sortedLayers
          .filter((layer) => !ChainSchema.safeParse(layer).success)
          .map(({ chain_id, chain_name, pretty_name }) => (
            <Alert color="danger" key={chain_id}>
              Layer {pretty_name ?? chain_name ?? chain_id} is not valid
            </Alert>
          ))}
      </Box>

      <Accordion px={20} value={value} onChange={setValue} multiple>
        {sortedLayers
          .filter((layer) => ChainSchema.safeParse(layer).success)
          .map((layer) => {
            const { chain_id, chain_name, pretty_name, logo_URIs } = layer
            return (
              <Accordion.Item value={chain_id} key={chain_id}>
                <Accordion.Control>
                  <Group spacing={4}>
                    <Image src={logo_URIs?.png} width={14} height={14} />
                    <Text fz={13} fw={600}>
                      {pretty_name ?? chain_name}
                    </Text>
                  </Group>
                </Accordion.Control>

                <Accordion.Panel>
                  <ErrorBoundary fallback={() => `${pretty_name ?? chain_name} failed to load`} key={chain_id}>
                    <AssetsInitiaLayer {...layer} />
                  </ErrorBoundary>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })}
      </Accordion>
    </Stack>
  )
}

export default AssetsInitia
