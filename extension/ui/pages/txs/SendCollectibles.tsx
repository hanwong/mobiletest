import { useMemo } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation, useParams } from "react-router-dom"
import { Box, Button, Container, Drawer, Group, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { Tx } from "@initia/utils"

import { defaultChain } from "../../../scripts/shared/chains"
import { useAddress, useDefinedLayer, useDefinedLayer1, useLayers } from "../../background"
import Icon from "../../styles/Icon"
import Page from "../../components/Page"
import FixedBottom from "../../components/FixedBottom"
import HomeHeader from "../home/components/HomeHeader"
import type { CollectibleTokenResponse, CollectionInfoResponse } from "../collectibles/data/collectibles"
import { useCollectionInfo, useCollectionTokensFromCache } from "../collectibles/data/collectibles"
import CollectibleThumbnail from "../collectibles/components/CollectibleThumbnail"
import CollectibleName from "../collectibles/components/CollectibleName"

import { useDefinedSearchParam } from "./helpers/param"
import useConfirm from "./helpers/useConfirm"
import SelectRecipient from "./components/SelectRecipient"
import SelectTargetChain from "./components/SelectTargetChain"

function getSize(index: number) {
  switch (index) {
    case 0:
      return 80

    case 1:
      return 70

    case 2:
      return 60

    default:
      return 0
  }
}

function getTotalWidth(length: number) {
  return getSize(0) + 6 * (length - 1)
}

interface Props {
  collectionInfo: CollectionInfoResponse
  tokenInfosMap: Map<string, CollectibleTokenResponse>
}

const MultipleCollectibleTokens = ({ collectionInfo, tokenInfosMap }: Props) => {
  const [primaryToken] = tokenInfosMap.values()
  const [opened, { open, close }] = useDisclosure()
  const sliced = [...tokenInfosMap.entries()].slice(0, 3)
  const lastIndex = sliced.length - 1

  return (
    <>
      <Group spacing={28} align="top">
        <Box pos="relative" w={getTotalWidth(sliced.length)} h={getSize(0)}>
          {sliced.map(([tokenAddress, tokenInfo], index) => (
            <Box
              pos="absolute"
              sx={{
                zIndex: lastIndex - index,
                top: (1 / 2) * (getSize(0) - getSize(index)),
                right: 6 * (lastIndex - index),
              }}
              key={tokenAddress}
            >
              <CollectibleThumbnail uri={tokenInfo.nft.uri} size={getSize(index)} shadow />
            </Box>
          ))}
        </Box>

        <Stack spacing={4}>
          <Text fz={12} fw={600}>
            {collectionInfo.collection.name}
          </Text>

          {primaryToken && (
            <CollectibleName uri={primaryToken.nft.uri} tokenId={primaryToken.nft.token_id} fz={20} fw={700} />
          )}

          <Box>
            {tokenInfosMap.size > 1 && (
              <UnstyledButton bg="white" c="mono.7" pl={10} pr={5} h={16} sx={{ borderRadius: 8 }} onClick={open}>
                <Group spacing={0}>
                  <Text fz={12} fw={700} lh="16px">
                    {tokenInfosMap.size}
                  </Text>
                  <Icon.ChevronRight width={12} height={12} />
                </Group>
              </UnstyledButton>
            )}
          </Box>
        </Stack>
      </Group>

      <Drawer opened={opened} onClose={close} title={`Selected items (${tokenInfosMap.size})`}>
        <Container>
          <SimpleGrid cols={3} px={20} spacing={4} verticalSpacing={20}>
            {[...tokenInfosMap.entries()].map(([tokenAddress, tokenInfo]) => (
              <Stack spacing={5} key={tokenAddress}>
                <CollectibleThumbnail uri={tokenInfo.nft.uri} />
                <CollectibleName uri={tokenInfo.nft.uri} tokenId={tokenInfo.nft.token_id} c="white" fz={12} fw={600} />
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Drawer>
    </>
  )
}

export interface SendCollectiblesValues {
  targetChainId: string
  recipientAddress: string
}

function useSendCollectiblesParams() {
  const { collectionAddress } = useParams()
  const { state } = useLocation()
  const tokenAddresses: string[] = state?.tokenAddresses
  const sourceChainId = useDefinedSearchParam("layer")
  const sourceLayer = useDefinedLayer(sourceChainId)
  if (!collectionAddress || !tokenAddresses || !tokenAddresses.length) throw new Error("NFT not selected")
  return { collectionAddress, tokenAddresses, sourceChainId, sourceLayer }
}

const SendCollectiblesForm = ({ collection }: { collection: CollectionInfoResponse }) => {
  const { collectionAddress, tokenAddresses, sourceChainId, sourceLayer } = useSendCollectiblesParams()
  const layers = useLayers()
  const l1 = useDefinedLayer1()

  const confirm = useConfirm()
  const address = useAddress()

  if (!collectionAddress || !tokenAddresses || !tokenAddresses.length) throw new Error("NFT not selected")

  const tokenInfos = useCollectionTokensFromCache(collectionAddress, tokenAddresses)
  const chain = defaultChain

  const tx = useMemo(
    () => new Tx({ address, layer: sourceLayer, layer1: l1, modules: chain.modules }),
    [address, chain, l1, sourceLayer],
  )

  const sendNFT = useMemo(() => tx.sendNFT({ collectionAddress }), [collectionAddress, tx])

  /* form */
  const form = useForm<SendCollectiblesValues>({ defaultValues: { targetChainId: sourceChainId } })
  const { handleSubmit } = form

  if (!tokenInfos) return null

  const tokenInfosMap = new Map(tokenAddresses.map((tokenAddress, index) => [tokenAddress, tokenInfos[index]]))
  const tokens = [...tokenInfos.values()]

  const submit = handleSubmit(async ({ targetChainId, recipientAddress }) => {
    try {
      const targetLayer = layers.find((layer) => layer.chain_id === targetChainId)!
      confirm({ messages: await sendNFT.getMessages({ targetLayer, recipientAddress, tokens }) }, sourceChainId)
    } catch (error) {
      if (error instanceof Error) modals.open({ children: <Text c="danger">{error.message}</Text> })
    }
  })

  return (
    <>
      <HomeHeader />

      <Page title="Send">
        <FormProvider {...form}>
          <form onSubmit={submit}>
            <Stack spacing={20}>
              <MultipleCollectibleTokens collectionInfo={collection} tokenInfosMap={tokenInfosMap} />
              <SelectTargetChain />
              <SelectRecipient />
            </Stack>

            <FixedBottom>
              <Button type="submit">Confirm</Button>
            </FixedBottom>
          </form>
        </FormProvider>
      </Page>
    </>
  )
}

const SendCollectibles = () => {
  const { collectionAddress, sourceLayer } = useSendCollectiblesParams()
  const { data } = useCollectionInfo(sourceLayer, collectionAddress)
  if (!data) return null
  return <SendCollectiblesForm collection={data} />
}

export default SendCollectibles
