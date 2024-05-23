import { Box, Group, Text } from "@mantine/core"
import type { CollectibleTokenResponse, CollectionInfoResponse } from "./data/collectibles"
import CollectibleThumbnail from "./components/CollectibleThumbnail"

interface Props {
  collectionInfo: CollectionInfoResponse
  count: number
  tokens: CollectibleTokenResponse[]
}

const CollectionSummary = ({ collectionInfo, count, tokens }: Props) => {
  const [primaryToken] = tokens

  return (
    <Group spacing={12}>
      {primaryToken && <CollectibleThumbnail uri={primaryToken.nft.uri} size={58} />}

      <Box>
        <Text fz={14} fw={600}>
          {collectionInfo.collection.name}
        </Text>

        <Text c="mono.5" fz={12} fw={700}>
          {count}
        </Text>
      </Box>
    </Group>
  )
}

export default CollectionSummary
