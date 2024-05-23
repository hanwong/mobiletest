import { Accordion, Alert, Box, Group, Image, Stack, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { ChainSchema } from "@initia/initia-registry-types/zod"
import { useLayers } from "../../background"
import CollectiblesLayer from "./CollectiblesLayer"

const Collectibles = () => {
  const layers = useLayers()
  const defaultLayer = layers.find(({ metadata }) => metadata?.is_l1)?.chain_id
  const [value, setValue] = useLocalStorage({
    key: "OpenedLayersCollectibles",
    defaultValue: defaultLayer ? [defaultLayer] : undefined,
    getInitialValueInEffect: false,
  })

  return (
    <Stack>
      <Box px={20}>
        {layers
          .filter((layer) => !ChainSchema.safeParse(layer).success)
          .map(({ chain_name, pretty_name }) => (
            <Alert color="danger">Layer {pretty_name ?? chain_name} is not valid</Alert>
          ))}
      </Box>

      <Accordion px={20} value={value} onChange={setValue} multiple>
        {layers
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
                  <CollectiblesLayer {...layer} />
                </Accordion.Panel>
              </Accordion.Item>
            )
          })}
      </Accordion>
    </Stack>
  )
}

export default Collectibles
