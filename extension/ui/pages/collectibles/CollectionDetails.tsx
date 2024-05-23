import { forwardRef, useEffect, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { sort } from "ramda"
import qs from "qs"
import { InView } from "react-intersection-observer"
import CheckIcon from "@mui/icons-material/Check"
import type { FlexProps } from "@mantine/core"
import { Button, Flex, Group, SimpleGrid, Stack, Text, UnstyledButton, createPolymorphicComponent } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { defined, required } from "@initia/utils"
import { parsePaginatedResponse } from "../../data/api"
import { useDefinedLayer } from "../../background"
import Page from "../../components/Page"
import FixedBottom from "../../components/FixedBottom"
import { useCollectionInfo, useCollectionTokens } from "./data/collectibles"
import CollectibleThumbnail from "./components/CollectibleThumbnail"
import CollectibleName from "./components/CollectibleName"

interface Props extends FlexProps {
  checked?: boolean
}

const CheckCircle = createPolymorphicComponent<"div", Props>(
  forwardRef<HTMLDivElement, Props>(({ checked, ...others }, ref) => {
    return (
      <Flex
        justify="center"
        align="center"
        bg="white"
        c="black"
        w={16}
        h={16}
        sx={{ borderRadius: "50%", zIndex: 1 }}
        {...others}
        ref={ref}
      >
        <CheckIcon sx={{ fontSize: 12, visibility: !checked ? "hidden" : undefined }} />
      </Flex>
    )
  }),
)

function useCollectionDetailsParams() {
  const [searchParams] = useSearchParams()
  const chainId = searchParams.get("layer")
  const layer = useDefinedLayer(required(chainId))
  const { collectionAddress } = useParams()
  defined(collectionAddress)
  return { layer, collectionAddress }
}

const CollectionDetails = () => {
  const navigate = useNavigate()
  const [isOpen, { toggle }] = useDisclosure()

  const { layer, collectionAddress } = useCollectionDetailsParams()
  const { data: collectionInfo } = useCollectionInfo(layer, collectionAddress)
  const { data, hasNextPage, isFetching, fetchNextPage } = useCollectionTokens(layer, collectionAddress)

  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setSelected([])
    }
  }, [isOpen])

  if (!(collectionInfo && data)) return null
  const { list } = parsePaginatedResponse(data, "tokens")

  const loadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }

  return (
    <Page
      title={collectionInfo.collection.name}
      action={
        <UnstyledButton bg="mono.5" h={24} px={10} sx={{ borderRadius: 24 / 2 }} onClick={toggle}>
          <Text fz={12} fw={600}>
            {isOpen ? "Cancel" : "Send"}
          </Text>
        </UnstyledButton>
      }
    >
      {isOpen && (
        <UnstyledButton
          h={40}
          mt={-20}
          onClick={() => {
            if (selected.length === list.length) {
              setSelected([])
            } else {
              setSelected(list.map((token) => token.object_addr))
            }
          }}
        >
          <Group spacing={6}>
            <CheckCircle checked={selected.length === list.length} />
            <Text fz={12} fw={700}>
              {selected.length}
              <Text c="mono.4" inherit span>
                /{list.length}
              </Text>
            </Text>
          </Group>
        </UnstyledButton>
      )}

      <SimpleGrid cols={3} spacing={4} verticalSpacing={20}>
        {list.map((token) => {
          const tokenAddress = token.object_addr || token.nft.token_id
          const isSelected = selected.includes(tokenAddress)

          const content = (
            <Stack spacing={4}>
              <CollectibleThumbnail uri={token.nft.uri} selected={isSelected} />
              <CollectibleName uri={token.nft.uri} tokenId={token.nft.token_id} fz={12} fw={600} truncate />
            </Stack>
          )

          if (isOpen) {
            const toggleSelect = () => {
              if (isSelected) {
                setSelected(selected.filter((id) => id !== tokenAddress))
              } else {
                setSelected(sort((a, b) => a.localeCompare(b), [...selected, tokenAddress]))
              }
            }

            return (
              <UnstyledButton onClick={toggleSelect} pos="relative" key={tokenAddress}>
                <CheckCircle checked={isSelected} pos="absolute" top={6} left={6} />
                {content}
              </UnstyledButton>
            )
          }

          return (
            <UnstyledButton
              component={Link}
              to={{
                pathname: `/collection/${collectionAddress}/${tokenAddress}`,
                search: qs.stringify({ layer: layer.chain_id }),
              }}
              key={tokenAddress}
            >
              {content}
            </UnstyledButton>
          )
        })}
      </SimpleGrid>

      {list.length > 0 && hasNextPage && (
        <InView onChange={(inView) => inView && loadMore()} rootMargin="240px">
          <UnstyledButton py={8} onClick={loadMore} mt={20}>
            <Text c="mono.5" fz={12} fw={600} ta="center">
              {isFetching ? "Loading..." : "Load more"}
            </Text>
          </UnstyledButton>
        </InView>
      )}

      {isOpen && (
        <FixedBottom>
          <Button
            onClick={() =>
              navigate(
                { pathname: `/send/collection/${collectionAddress}`, search: qs.stringify({ layer: layer.chain_id }) },
                { state: { tokenAddresses: selected } },
              )
            }
            disabled={!selected.length}
          >
            Next
          </Button>
        </FixedBottom>
      )}
    </Page>
  )
}

export default CollectionDetails
