import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import qs from "qs"
import { Box, Button, Group, Stack, Text } from "@mantine/core"
import { defined, getRest, required } from "@initia/utils"
import { useDefinedLayer } from "../../background"
import Icon from "../../styles/Icon"
import Page from "../../components/Page"
import FixedBottom from "../../components/FixedBottom"
import { useCollectionInfo, useCollectibleTokenInfo, useCollectibleMetadata } from "./data/collectibles"
import CollectibleThumbnail from "./components/CollectibleThumbnail"
import CollectibleName from "./components/CollectibleName"

function useCollectibleTokenDetailsParams() {
  const { collectionAddress, tokenAddress } = useParams()
  const [searchParams] = useSearchParams()
  const chainId = searchParams.get("layer")
  const layer = useDefinedLayer(required(chainId))
  const type = required(
    layer.metadata?.is_l1 ? "minimove" : layer.metadata?.minitia?.type,
    `Failed to get minitia type for ${layer.chain_id}`,
  )

  defined(collectionAddress)
  defined(tokenAddress)
  return { layer, collectionAddress, tokenAddress, type }
}

const CollectibleTokenDetails = () => {
  const navigate = useNavigate()
  const { layer, collectionAddress, tokenAddress, type } = useCollectibleTokenDetailsParams()

  const { data: collectionInfo } = useCollectionInfo(layer, collectionAddress)
  const { data: tokenInfo } = useCollectibleTokenInfo(getRest(layer), collectionAddress, tokenAddress, type)
  const { data: metadata } = useCollectibleMetadata(tokenInfo?.uri)

  if (!(tokenInfo && collectionInfo)) return null

  const attributes = metadata?.attributes

  return (
    <Page title={collectionInfo.collection.name}>
      <Stack spacing={12}>
        <CollectibleThumbnail uri={tokenInfo.uri} />
        <CollectibleName uri={tokenInfo.uri} tokenId={tokenInfo.token_id} fz={24} truncate />
      </Stack>

      {attributes && (
        <Box mt={40}>
          <Group spacing={4}>
            <Icon.ListDetails />
            <Text fz={14} fw={600} tt="uppercase">
              Traits ({attributes.length})
            </Text>
          </Group>

          <Stack spacing={12} mt={20}>
            {attributes.map(({ trait_type, value }) => (
              <Box key={trait_type} p={12} sx={({ fn }) => ({ borderRadius: 12, background: fn.themeColor("mono.7") })}>
                <Text c="mono.4" fz={12} fw={600}>
                  {trait_type}
                </Text>
                <Text fz={16} fw={700}>
                  {value}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <FixedBottom>
        <Button
          onClick={() => {
            navigate(
              { pathname: `/send/collection/${collectionAddress}`, search: qs.stringify({ layer: layer.chain_id }) },
              { state: { tokenAddresses: [tokenAddress] } },
            )
          }}
        >
          Send
        </Button>
      </FixedBottom>
    </Page>
  )
}

export default CollectibleTokenDetails
