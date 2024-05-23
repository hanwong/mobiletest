import axios from "axios"
import { useQueryClient, type InfiniteData } from "@tanstack/svelte-query"
import { StargateClient } from "@cosmjs/stargate"
import type { Event } from "@cosmjs/stargate/build/events"
import { HttpClient, Comet38Client } from "@cosmjs/tendermint-rpc"
import {
  type SwapPair,
  AddressUtils,
  createHTTPClient,
  createInitiaDexClient,
  createInitiaMoveClient,
  createInitiaUsernamesClient,
  defined,
  denomToMetadata,
  getAPI,
  getRPC,
  getRest,
  isUsernameValid,
} from "@initia/utils"
import type { Asset, Chain } from "@initia/initia-registry-types"
import { modules, omnitiaURL, swaplistURL } from "../stores/config"

export class OmnitiaQueries {
  private static instance: OmnitiaQueries
  #layer1?: Chain
  #assets: Asset[] = []
  #swaplistMap: Map<string, SwapPair> = new Map()

  get layer1() {
    defined(this.#layer1, "Layer 1 not initialized yet")
    return this.#layer1
  }

  get assets() {
    return this.#assets
  }

  get swaplistMap() {
    return this.#swaplistMap
  }

  static async initialize(): Promise<void> {
    if (OmnitiaQueries.instance) return
    OmnitiaQueries.instance = new OmnitiaQueries()

    try {
      OmnitiaQueries.instance.#layer1 = await createHTTPClient(omnitiaURL).get<Chain>("/v1/registry/chains/layer1")
    } catch {
      throw new Error("Failed to initialize layer 1")
    }

    try {
      const assetlist = OmnitiaQueries.instance.#layer1.metadata?.assetlist
      if (!assetlist) return
      const { assets } = await (await fetch(assetlist)).json()
      OmnitiaQueries.instance.#assets = assets
    } catch {
      //
    }
  }

  static getInstance(): OmnitiaQueries {
    if (!OmnitiaQueries.instance) {
      throw new Error("Not initialized yet")
    }

    return OmnitiaQueries.instance
  }

  static async initializeSwaplist(): Promise<Map<string, SwapPair>> {
    const response = await fetch(swaplistURL)
    const swaplist: Record<string, SwapPair> = await response.json()
    OmnitiaQueries.instance.#swaplistMap = new Map(Object.entries(swaplist))
    return OmnitiaQueries.instance.#swaplistMap
  }

  getSpotPriceBasedINIT(askDenom: string) {
    const findLpToken = getFindLpToken(this.swaplistMap)
    const client = createInitiaDexClient(getRest(this.layer1))
    const offerDenom = "uinit"
    const offerMetadata = denomToMetadata(offerDenom)
    const lpTokenMetadata = findLpToken(offerDenom, askDenom)

    return {
      queryKey: [client.rest, [lpTokenMetadata, offerDenom, askDenom], "SpotPrice"],
      queryFn: async () => {
        if (askDenom === "uinit") return 1
        if (!lpTokenMetadata) return null
        return client.getSpotPrice(offerMetadata, lpTokenMetadata)
      },
      enabled: !!askDenom,
    }
  }
}

export function getFindLpToken(swaplistMap: Map<string, SwapPair>) {
  return (offerDenom: string, askDenom: string) =>
    [...swaplistMap.entries()].find(
      ([, [a, b]]) =>
        (a.denom === offerDenom && b.denom === askDenom) || (a.denom === askDenom && b.denom === offerDenom),
    )?.[0]
}

export class LayerQueries {
  private static instances: Map<string, LayerQueries> = new Map()
  private stargateClient?: StargateClient

  private constructor(private chain: Chain) {}

  private get rpc() {
    return getRPC(this.chain)
  }

  private get rest() {
    return getRest(this.chain)
  }

  private get api() {
    return getAPI(this.chain)
  }

  public static getInstance(chain: Chain) {
    const instance = LayerQueries.instances.get(chain.chain_id)

    if (instance) {
      return instance
    }

    const newInstance = new LayerQueries(chain)
    LayerQueries.instances.set(chain.chain_id, newInstance)
    return newInstance
  }

  private async ensureClient() {
    if (!this.stargateClient) {
      const cometClient = await Comet38Client.create(new HttpClient(this.rpc))
      this.stargateClient = await StargateClient.create(cometClient)
    }

    return this.stargateClient
  }

  public balances(address: string) {
    return {
      queryKey: [this.rpc, address, "balances"],
      queryFn: async () => {
        const client = await this.ensureClient()
        return client.getAllBalances(address)
      },
    }
  }

  public balance(address: string, denom: string) {
    return {
      queryKey: [this.rpc, address, "balance", denom],
      queryFn: async () => {
        const client = await this.ensureClient()
        const { amount } = await client.getBalance(address, denom)
        return amount
      },
    }
  }

  public username(address: string) {
    return {
      queryKey: [this.rest, address, "username"],
      queryFn: async () => {
        if (!AddressUtils.isValid(address)) return null
        const client = createInitiaUsernamesClient(this.rest, modules.usernames)
        return client.getUsername(address)
      },
      staleTime: Infinity,
    }
  }

  public addressFromUsername(username: string) {
    return {
      queryKey: [this.rest, username, "address"],
      queryFn: async () => {
        if (!isUsernameValid(username)) return null
        const client = createInitiaUsernamesClient(this.rest, modules.usernames)
        return client.getAddress(username)
      },
      staleTime: Infinity,
    }
  }

  public tokenInfo(denom: string) {
    return {
      queryKey: [this.rest, denom],
      queryFn: async (): Promise<Asset | null> => {
        const client = createInitiaMoveClient(this.rest)
        const metadata = denomToMetadata(denom)
        type MetadataResource = { name: string; symbol: string; decimals: number }
        if (this.chain.metadata?.minitia?.type === "miniwasm") return null
        const data = await client.resource<MetadataResource>(metadata, "0x1::fungible_asset::Metadata")
        const { name, symbol, decimals } = data
        return { denom_units: [{ denom, exponent: decimals }], base: denom, display: symbol, name, symbol }
      },
      staleTime: Infinity,
    }
  }

  public metdataToDenom(metadata: string) {
    return {
      queryKey: [this.rest, metadata],
      queryFn: async () => {
        const client = createInitiaMoveClient(this.rest)
        return client.denom(metadata)
      },
      staleTime: Infinity,
    }
  }

  public price(denom: string) {
    return {
      queryKey: [this.api, denom, "price"],
      queryFn: async () => {
        if (!this.api) return null

        const { prices } = await createHTTPClient(this.api).get<{ prices: { [denom: string]: number } }>(
          `/indexer/price/v1/prices/${encodeURIComponent(denom)}`,
        )

        return prices[denom] || null
      },
    }
  }

  public collections(address: string) {
    const baseURL = this.api ?? this.rest
    type CollectionsResponse = PaginatedResponse<{ collections: CollectionInfoResponse[] }>
    return {
      queryKey: [baseURL, address, "Collections"],
      queryFn: async ({ pageParam: key = "" }) => {
        if (!address) throw new Error("No address")

        const { data } = await axios.get<CollectionsResponse>(`/indexer/nft/v1/collections/by_account/${address}`, {
          baseURL,
          params: { "pagination.key": key },
        })

        return data
      },
      getNextPageParam: (data: PaginatedResponse) => data.pagination?.next_key,
      initialPageParam: "",
    }
  }

  public collectionTokens(collectionAddress: string, address: string) {
    const baseURL = this.api ?? this.rest
    type CollectionTokensResponse = PaginatedResponse<{ tokens: NFTTokenResponse[] }>
    const queryClient = useQueryClient()
    return {
      queryKey: [baseURL, address, "CollectionTokens", collectionAddress],
      queryFn: async ({ pageParam: key = "" }) => {
        if (!address) throw new Error("No address")

        const { data } = await axios.get<CollectionTokensResponse>(`/indexer/nft/v1/tokens/by_account/${address}`, {
          baseURL,
          params: { collection_addr: collectionAddress, "pagination.key": key },
        })

        return data
      },
      getNextPageParam: (data: PaginatedResponse) => data.pagination?.next_key,
      initialPageParam: "",
      onSuccess: (data: InfiniteData<CollectionTokensResponse>) => {
        if (!data) return
        const tokens = data.pages.map((data) => data?.tokens).flat()

        for (const token of tokens) {
          if (!token) return

          queryClient.setQueryData<NFTTokenResponse>([this.api, token.object_addr, "NFT:Token"], token)
        }
      },
    }
  }

  public collectionInfo(collectionAddress: string) {
    const baseURL = this.api ?? this.rest
    return {
      queryKey: [baseURL, "Collection"],
      queryFn: async () => {
        const { data } = await axios.get<{ collection: CollectionInfoResponse }>(
          `/indexer/nft/v1/collections/${collectionAddress}`,
          { baseURL },
        )

        return data.collection
      },
    }
  }

  static handleURL(url?: string) {
    return url?.replace("ipfs://", "https://ipfs.io/ipfs/")
  }

  static nftMetadata(url?: string) {
    const queryURL = this.handleURL(url)
    return {
      queryKey: ["NFT:Metadata", queryURL],
      queryFn: async (): Promise<NFTMetadata> => {
        try {
          if (!queryURL) return {}
          const { data: metadata } = await axios.get<NFTMetadata>(queryURL)
          return { ...metadata, image: this.handleURL(metadata.image) }
        } catch {
          return {}
        }
      },
      staleTime: Infinity,
    }
  }

  public txs(address: string) {
    const baseURL = this.api ?? this.rest
    return {
      queryKey: [baseURL, address, "Activity"],
      queryFn: async ({ pageParam: key = "" }) => {
        const params = { "pagination.key": key, "pagination.reverse": true }
        const { data } = await axios.get<PaginatedResponse<{ txs: TxItem[] }>>(
          `/indexer/tx/v1/txs/by_account/${address}`,
          { baseURL, params },
        )
        return data
      },
      getNextPageParam: (data: PaginatedResponse) => data.pagination?.next_key,
      initialPageParam: "",
    }
  }
}

/* Asset */
export function toAsset({
  denom,
  symbol,
  decimals = 0,
  name = "",
}: {
  denom: string
  symbol?: string
  decimals?: number
  name?: string
}): Asset {
  return {
    denom_units: [{ denom, exponent: decimals }],
    base: denom,
    display: symbol || denom,
    name,
    symbol: symbol || denom,
  }
}

/* NFT */
export interface CollectionInfoResponse {
  object_addr: string
  collection: { name: string; description: string; uri: string; creator_addr: string }
}

export interface NFTTokenResponse {
  collection_addr: string
  collection_name: string
  nft: { token_id: string; uri: string; description: string }
  object_addr: string
}

export interface NFTMetadata {
  name?: string
  image?: string
  description?: string
  attributes?: { trait_type: string; value: string }[]
}

/* Activity */
export interface TxItem {
  tx: Tx
  code: number
  events: Event[]
  txhash: string
  timestamp: Date
}

interface Tx {
  body: Body
}

interface Body {
  memo: string
  messages: Message[]
}

interface Message {
  "@type": string
  [key: string]: unknown
}

/* Pagination */
export type PaginatedResponse<T = unknown> = {
  pagination?: {
    next_key: string | null
    total: string
  }
} & T

export function parsePaginatedResponse<T>(data: InfiniteData<PaginatedResponse<T>> | undefined, key: keyof T) {
  const list = data?.pages?.map((page) => page[key] ?? []).flat() ?? []
  const count = Number(data?.pages?.[0]?.pagination?.total) || 0
  return { list, count }
}
