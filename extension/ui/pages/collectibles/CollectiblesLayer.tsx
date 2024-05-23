import { Link } from "react-router-dom"
import { InView } from "react-intersection-observer"
import { Flex, Group, Stack, Text, UnstyledButton, createStyles, getStylesRef } from "@mantine/core"
import type { Chain } from "@initia/initia-registry-types"
import { parsePaginatedResponse } from "../../data/api"
import { useAddress } from "../../background"
import Icon from "../../styles/Icon"
import Empty from "../home/components/Empty"
import { useUpdateLayerLength } from "./data/length"
import type { CollectibleTokenResponse, CollectionInfoResponse } from "./data/collectibles"
import { useCollectionTokens, useCollections } from "./data/collectibles"
import CollectionSummary from "./CollectionSummary"

interface Props {
  layer: Chain
  collectionInfo: CollectionInfoResponse
}

const useStyles = createStyles({
  root: { [`&:not(:hover) .${getStylesRef("hover")}`]: { display: "none" } },
  hover: { ref: getStylesRef("hover") },
})

const CollectionItemLayer = ({
  layer,
  list,
  count,
  collectionInfo,
}: Props & { list: CollectibleTokenResponse[]; count: number }) => {
  const { classes } = useStyles()
  const address = useAddress()

  useUpdateLayerLength({
    address,
    chainId: layer.chain_id,
    collectionAddress: collectionInfo.object_addr,
    value: count,
  })

  return (
    <UnstyledButton
      component={Link}
      to={`/collection/${collectionInfo.object_addr}?layer=${layer.chain_id}`}
      px={20}
      py={8}
      sx={({ fn }) => ({ ...fn.hover({ background: fn.themeColor("mono.6") }) })}
      className={classes.root}
    >
      <Group position="apart">
        <CollectionSummary collectionInfo={collectionInfo} count={count} tokens={list} />

        <Flex c="mono.3" className={classes.hover}>
          <Icon.ChevronRight />
        </Flex>
      </Group>
    </UnstyledButton>
  )
}

const CollectionItem = ({ layer, collectionInfo }: Props) => {
  const { data } = useCollectionTokens(layer, collectionInfo.object_addr)
  if (!data) return null
  const { list, count } = parsePaginatedResponse(data, "tokens")
  return <CollectionItemLayer layer={layer} collectionInfo={collectionInfo} list={list} count={count} />
}

const CollectiblesLayer = (layer: Chain) => {
  const { data, hasNextPage, isFetching, fetchNextPage } = useCollections(layer)
  if (!data) return null
  const { list } = parsePaginatedResponse(data, "collections")

  const loadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }

  if (!list.length) return <Empty>No NFT</Empty>

  return (
    <Stack spacing={0} py={4}>
      {list.map((collectionInfo) => (
        <CollectionItem layer={layer} collectionInfo={collectionInfo} key={collectionInfo.object_addr} />
      ))}

      {list.length > 0 && hasNextPage && (
        <InView onChange={(inView) => inView && loadMore()} rootMargin="240px">
          <UnstyledButton py={8} onClick={loadMore} mt={20}>
            <Text c="mono.5" fz={12} fw={600} ta="center">
              {isFetching ? "Loading..." : "Load more"}
            </Text>
          </UnstyledButton>
        </InView>
      )}
    </Stack>
  )
}

export default CollectiblesLayer
