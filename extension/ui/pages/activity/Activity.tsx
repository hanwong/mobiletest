import { useEffect } from "react"
import axios from "axios"
import { useRecoilState } from "recoil"
import { InView } from "react-intersection-observer"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Box, Button, Container, Drawer, Flex, Group, Image, Stack, Text, UnstyledButton } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { ErrorBoundary } from "@initia/react-components"
import { getAPI, getRest } from "@initia/utils"
import type { PaginatedResponse } from "../../data/api"
import { parsePaginatedResponse } from "../../data/api"
import { useAddress, useFindLayer, useLayers } from "../../background"
import Icon from "../../styles/Icon"
import Empty from "../home/components/Empty"
import { activityLayerState, useActivityLayer } from "./activity-state"
import type { TxItem } from "./Activity.types"
import ActivityItem from "./ActivityItem"

function useTxs() {
  const address = useAddress()

  const layer = useActivityLayer()
  const baseURL = getAPI(layer) ?? getRest(layer)

  return useInfiniteQuery({
    queryKey: [baseURL, address, "Activity"],
    queryFn: async ({ pageParam: key }) => {
      const params = { "pagination.key": key, "pagination.reverse": true }
      const { data } = await axios.get<PaginatedResponse<{ txs: TxItem[] }>>(
        `/indexer/tx/v1/txs/by_account/${address}`,
        { baseURL, params },
      )
      return data
    },
    getNextPageParam: (data) => data.pagination?.next_key,
  })
}

const SelectLayer = () => {
  const [activityLayer, setActivityLayer] = useRecoilState(activityLayerState)
  const layers = useLayers()
  const selectedLayer = useFindLayer(activityLayer)
  const [opened, { open, close }] = useDisclosure()

  const selectLayer = (chainId: string) => {
    setActivityLayer(chainId)
    close()
  }

  useEffect(() => {
    if (!activityLayer) {
      setActivityLayer(layers[0]?.chain_id)
    }
  }, [activityLayer, layers, setActivityLayer])

  return (
    <>
      <Flex justify="flex-end" px={20}>
        <UnstyledButton
          h={34}
          px={16}
          sx={({ fn }) => ({
            border: `1px solid ${fn.themeColor("mono.5")}`,
            borderRadius: 34 / 2,
            ...fn.hover({
              borderColor: fn.themeColor("mono.1"),
            }),
          })}
          onClick={open}
        >
          <Group spacing={8}>
            <Text c="mono.1" fz={12} fw={600}>
              {selectedLayer?.pretty_name ?? selectedLayer?.chain_name}
            </Text>
            <Text c="mono.5">
              <Icon.ChevronDown width={12} height={12} />
            </Text>
          </Group>
        </UnstyledButton>
      </Flex>

      <Drawer opened={opened} onClose={close} title="Select a network">
        <Container>
          <Stack spacing={8} px={20}>
            {layers.map((layer) => (
              <Button
                variant="item"
                onClick={() => selectLayer(layer.chain_id)}
                data-active={activityLayer === layer.chain_id || undefined}
                key={layer.chain_id}
              >
                <Group spacing={8}>
                  <Image src={layer.logo_URIs?.png} width={26} height={26} />
                  <Text>{layer.pretty_name ?? layer.chain_name}</Text>
                </Group>
              </Button>
            ))}
          </Stack>
        </Container>
      </Drawer>
    </>
  )
}

const Activity = () => {
  const { data, hasNextPage, isFetching, fetchNextPage } = useTxs()
  if (!data) return null
  const { list } = parsePaginatedResponse(data, "txs")

  const loadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }

  return (
    <Box>
      <SelectLayer />

      {list.length > 0 ? (
        list.map((tx) => (
          <ErrorBoundary key={tx.txhash}>
            <ActivityItem {...tx} />
          </ErrorBoundary>
        ))
      ) : (
        <Empty>No activity yet</Empty>
      )}

      <Box px={20}>
        {list.length > 0 && hasNextPage && (
          <InView onChange={(inView) => inView && loadMore()} rootMargin="240px">
            <UnstyledButton py={8} onClick={loadMore} mt={20}>
              <Text c="mono.5" fz={12} fw={600} ta="center">
                {isFetching ? "Loading..." : "Load more"}
              </Text>
            </UnstyledButton>
          </InView>
        )}
      </Box>
    </Box>
  )
}

export default Activity
