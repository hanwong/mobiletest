import axios from "axios"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { createQueryKeyStore } from "@lukemorales/query-key-factory"
import { createInitiaNftClient, getAPI, getRest } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import type { PaginatedResponse } from "../../../data/api"
import { useAddress } from "../../../background"

export const queryKeys = createQueryKeyStore({
  collectibles: {
    collectionToken: ({ collectionAddress, tokenAddress }: { collectionAddress: string; tokenAddress: string }) => ({
      queryKey: [collectionAddress, tokenAddress, "CollectionToken"],
    }),
  },
})

/* collection */
export interface CollectionInfoResponse {
  object_addr: string
  collection: { name: string; description: string; uri: string; creator_addr: string }
}

/* token */
export interface CollectibleTokenResponse {
  collection_addr: string
  collection_name: string
  nft: { token_id: string; uri: string; description: string }
  object_addr: string
}

export function useCollections(layer: Chain) {
  const baseURL = getAPI(layer) ?? getRest(layer)
  const address = useAddress()
  return useInfiniteQuery({
    queryKey: [baseURL, address, "Collections"],
    queryFn: async ({ pageParam: key }) => {
      if (!address) throw new Error("No address")

      type CollectionsResponse = PaginatedResponse<{ collections: CollectionInfoResponse[] }>
      const { data } = await axios.get<CollectionsResponse>(`/indexer/nft/v1/collections/by_account/${address}`, {
        baseURL,
        params: { "pagination.key": key },
      })

      return data
    },
    getNextPageParam: (data) => data.pagination?.next_key,
  })
}

export function useCollectionTokens(layer: Chain, collectionAddress: string) {
  const baseURL = getAPI(layer) ?? getRest(layer)
  const address = useAddress()
  const queryClient = useQueryClient()
  return useInfiniteQuery({
    queryKey: [baseURL, address, "CollectionTokens", collectionAddress],
    queryFn: async ({ pageParam: key }) => {
      if (!address) throw new Error("No address")

      type CollectionTokensResponse = PaginatedResponse<{ tokens: CollectibleTokenResponse[] }>
      const { data } = await axios.get<CollectionTokensResponse>(`/indexer/nft/v1/tokens/by_account/${address}`, {
        baseURL,
        params: { collection_addr: collectionAddress, "pagination.key": key },
      })

      return data
    },
    getNextPageParam: (data) => data.pagination?.next_key,
    onSuccess: (data) => {
      if (!data) return
      const tokens = data.pages.map((data) => data?.tokens).flat()

      for (const token of tokens) {
        if (!token) return

        queryClient.setQueryData<CollectibleTokenResponse>(
          queryKeys.collectibles.collectionToken({
            collectionAddress,
            tokenAddress: token.object_addr || token.nft.token_id,
          }).queryKey,
          token,
        )
      }
    },
  })
}

export function useCollectionInfo(layer: Chain, collectionAddress: string) {
  const baseURL = getAPI(layer) ?? getRest(layer)
  return useQuery({
    queryKey: [baseURL, "Collection"],
    queryFn: async () => {
      const { data } = await axios.get<{ collection: CollectionInfoResponse }>(
        `/indexer/nft/v1/collections/${collectionAddress}`,
        { baseURL },
      )

      return data.collection
    },
  })
}

export function useCollectibleTokenInfo(
  rest: string,
  collectionAddress: string,
  tokenAddress: string,
  type: "minimove" | "miniwasm" | "minievm" | "custom",
) {
  const client = createInitiaNftClient(rest, collectionAddress, type)
  return useQuery({
    queryKey: [client.rest, tokenAddress, "CollectibleTokenInfo"],
    queryFn: () => client.getTokenInfo(tokenAddress),
    staleTime: Infinity,
  })
}

export function useCollectionTokensFromCache(collectionAddress: string, tokenAddresses: string[]) {
  const queryClient = useQueryClient()
  return tokenAddresses.map((tokenAddress) => {
    const data = queryClient.getQueryData<CollectibleTokenResponse>(
      queryKeys.collectibles.collectionToken({ collectionAddress, tokenAddress }).queryKey,
    )

    if (!data) throw new Error(`No data for ${tokenAddress}`)
    return data
  })
}

export interface CollectibleMetadata {
  name?: string
  image?: string
  description?: string
  attributes?: { trait_type: string; value: string }[]
}

function handleURL(url?: string) {
  return url?.replace("ipfs://", "https://ipfs.io/ipfs/")
}

export function useCollectibleMetadata(url?: string) {
  const queryURL = handleURL(url)
  return useQuery<CollectibleMetadata>({
    queryKey: ["Collectible:Metadata", queryURL],
    queryFn: async () => {
      try {
        if (!queryURL) return {}
        const { data: metadata } = await axios.get<CollectibleMetadata>(queryURL)
        return { ...metadata, image: handleURL(metadata.image) }
      } catch {
        return {}
      }
    },
    staleTime: Infinity,
  })
}
