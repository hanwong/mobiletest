import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Box, Button, Group, Image, Stack, Text } from "@mantine/core"
import { createHTTPClient } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { defaultChain } from "../../../scripts/shared/chains"
import { request, useLayers } from "../../background"
import toast from "../../styles/toast"
import Icon from "../../styles/Icon"
import type { CompactChain } from "./ManageLayers"

const ManageLayerItem = ({ layer }: { layer: CompactChain }) => {
  const { chain_id, chain_name, pretty_name, description, logo_URIs, website } = layer
  const { omnitia } = defaultChain

  const layers = useLayers()

  const isAdded = layers.some((layer) => layer.chain_id === chain_id)

  const queryClient = useQueryClient()
  const addLayer = useMutation({
    mutationFn: async () => {
      const layer = await createHTTPClient(omnitia).get<Chain>(`/v1/registry/chains/${chain_id}`)
      await request("addLayer", layer)
      await queryClient.invalidateQueries()
    },
    onSuccess: () => {
      toast.success(`Minitia ${pretty_name ?? chain_name} added`)
    },
    onError: (error) => {
      toast.error(String(error))
    },
  })

  const deleteLayer = useMutation({
    mutationFn: async () => {
      await request("deleteLayer", chain_id)
      await queryClient.invalidateQueries()
    },
    onSuccess: () => {
      toast.success(`Minitia ${chain_id} deleted`)
    },
    onError: (error) => {
      toast.error(String(error))
    },
  })

  const logoElement = <Image src={logo_URIs?.png} width={32} height={32} />

  const contentElement = (
    <Box>
      <Text c="mono.0" fz={16} fw={600}>
        {pretty_name ?? chain_name}
      </Text>
      {description && (
        <Text c="mono.3" fz={12} fw={500}>
          {description}
        </Text>
      )}
    </Box>
  )

  const footerElement = (
    <Group spacing={8} grow>
      <Button variant="small" component="a" href={website} target="_blank" disabled={!website}>
        <Group spacing={4}>
          <Icon.ExternalLink width={12} height={12} />
          <Text>Website</Text>
        </Group>
      </Button>

      {layer.chain_id !== defaultChain.chainId && (
        <Button
          variant="small"
          onClick={() => (isAdded ? deleteLayer.mutate() : addLayer.mutate())}
          disabled={addLayer.isLoading}
        >
          {!isAdded ? (
            <Group spacing={4}>
              <Icon.Plus width={12} height={12} />
              <Text>Add</Text>
            </Group>
          ) : (
            <Group spacing={4}>
              <Icon.Trash width={12} height={12} />
              <Text>Delete</Text>
            </Group>
          )}
        </Button>
      )}
    </Group>
  )

  return (
    <Stack spacing={12} bg="mono.7" px={20} py={16} sx={{ borderRadius: 20 }}>
      <Group spacing={8}>
        {logoElement}
        {contentElement}
      </Group>
      {footerElement}
    </Stack>
  )
}

export default ManageLayerItem
