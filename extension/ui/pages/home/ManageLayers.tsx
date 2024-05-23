import { useDisclosure } from "@mantine/hooks"
import { Drawer, Group, Stack, Text, UnstyledButton } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { createHTTPClient } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { defaultChain } from "../../../scripts/shared/chains"
import { useLayers } from "../../background"
import Page from "../../components/Page"
import Icon from "../../styles/Icon"
import AddCustomLayer from "./AddCustomLayer"
import ManageLayerItem from "./ManageLayerItem"

export type CompactChain = Pick<
  Chain,
  "chain_id" | "chain_name" | "pretty_name" | "description" | "logo_URIs" | "website"
>

const ManageLayers = () => {
  const layers = useLayers()
  const [opened, { open, close }] = useDisclosure()

  const chain = defaultChain
  const { omnitia } = chain
  const { data: allLayers = [] } = useQuery({
    queryKey: [omnitia, "layers"],
    queryFn: async () => createHTTPClient(omnitia).get<CompactChain[]>("/v1/registry/chains/compact"),
  })

  const notAddedLayers = allLayers.filter((layer) => !layers.some((l) => l.chain_id === layer.chain_id))

  return (
    <Page title="Manage my Minitias">
      <Stack spacing={28}>
        <Stack spacing={8}>
          <Text tt="uppercase">Shown</Text>

          {layers.map((layer) => (
            <ManageLayerItem layer={layer} key={layer.chain_id} />
          ))}
        </Stack>

        <Stack spacing={8}>
          <Group position="apart">
            <Text tt="uppercase">{notAddedLayers.length === 0 ? "" : "Hidden"}</Text>

            <UnstyledButton c="mono.4" onClick={open}>
              <Group spacing={2}>
                <Icon.Plus width={10} height={10} />
                <Text fz={12} fw={600}>
                  Add a custom Minitia
                </Text>
              </Group>
            </UnstyledButton>
          </Group>

          {notAddedLayers.map((layer) => (
            <ManageLayerItem layer={layer} key={layer.chain_id} />
          ))}
        </Stack>
      </Stack>

      <Drawer opened={opened} onClose={close}>
        <AddCustomLayer onClose={close} />
      </Drawer>
    </Page>
  )
}

export default ManageLayers
