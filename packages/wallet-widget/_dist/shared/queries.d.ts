import { InfiniteData } from '@tanstack/svelte-query';
import { Event } from '@cosmjs/stargate/build/events';
import { SwapPair } from '@initia/utils';
import { Asset, Chain } from '@initia/initia-registry-types';

export declare class OmnitiaQueries {
    #private;
    private static instance;
    get layer1(): Chain;
    get assets(): Asset[];
    get swaplistMap(): Map<string, SwapPair>;
    static initialize(): Promise<void>;
    static getInstance(): OmnitiaQueries;
    static initializeSwaplist(): Promise<Map<string, SwapPair>>;
    getSpotPriceBasedINIT(askDenom: string): {
        queryKey: (string | (string | undefined)[])[];
        queryFn: () => Promise<string | 1 | null>;
        enabled: boolean;
    };
}
export declare function getFindLpToken(swaplistMap: Map<string, SwapPair>): (offerDenom: string, askDenom: string) => string | undefined;
export declare class LayerQueries {
    private chain;
    private static instances;
    private stargateClient?;
    private constructor();
    private get rpc();
    private get rest();
    private get api();
    static getInstance(chain: Chain): LayerQueries;
    private ensureClient;
    balances(address: string): {
        queryKey: string[];
        queryFn: () => Promise<readonly import('cosmjs-types/cosmos/base/v1beta1/coin').Coin[]>;
    };
    balance(address: string, denom: string): {
        queryKey: string[];
        queryFn: () => Promise<string>;
    };
    username(address: string): {
        queryKey: string[];
        queryFn: () => Promise<string | null>;
        staleTime: number;
    };
    addressFromUsername(username: string): {
        queryKey: string[];
        queryFn: () => Promise<string | null>;
        staleTime: number;
    };
    tokenInfo(denom: string): {
        queryKey: string[];
        queryFn: () => Promise<Asset | null>;
        staleTime: number;
    };
    metdataToDenom(metadata: string): {
        queryKey: string[];
        queryFn: () => Promise<string>;
        staleTime: number;
    };
    price(denom: string): {
        queryKey: (string | undefined)[];
        queryFn: () => Promise<number | null>;
    };
    collections(address: string): {
        queryKey: string[];
        queryFn: ({ pageParam: key }: {
            pageParam?: string | undefined;
        }) => Promise<PaginatedResponse<{
            collections: CollectionInfoResponse[];
        }>>;
        getNextPageParam: (data: PaginatedResponse) => string | null | undefined;
        initialPageParam: string;
    };
    collectionTokens(collectionAddress: string, address: string): {
        queryKey: string[];
        queryFn: ({ pageParam: key }: {
            pageParam?: string | undefined;
        }) => Promise<PaginatedResponse<{
            tokens: NFTTokenResponse[];
        }>>;
        getNextPageParam: (data: PaginatedResponse) => string | null | undefined;
        initialPageParam: string;
        onSuccess: (data: InfiniteData<PaginatedResponse<{
            tokens: NFTTokenResponse[];
        }>, unknown>) => void;
    };
    collectionInfo(collectionAddress: string): {
        queryKey: string[];
        queryFn: () => Promise<CollectionInfoResponse>;
    };
    static handleURL(url?: string): string | undefined;
    static nftMetadata(url?: string): {
        queryKey: (string | undefined)[];
        queryFn: () => Promise<NFTMetadata>;
        staleTime: number;
    };
    txs(address: string): {
        queryKey: string[];
        queryFn: ({ pageParam: key }: {
            pageParam?: string | undefined;
        }) => Promise<PaginatedResponse<{
            txs: TxItem[];
        }>>;
        getNextPageParam: (data: PaginatedResponse) => string | null | undefined;
        initialPageParam: string;
    };
}
export declare function toAsset({ denom, symbol, decimals, name, }: {
    denom: string;
    symbol?: string;
    decimals?: number;
    name?: string;
}): Asset;
export interface CollectionInfoResponse {
    object_addr: string;
    collection: {
        name: string;
        description: string;
        uri: string;
        creator_addr: string;
    };
}
export interface NFTTokenResponse {
    collection_addr: string;
    collection_name: string;
    nft: {
        token_id: string;
        uri: string;
        description: string;
    };
    object_addr: string;
}
export interface NFTMetadata {
    name?: string;
    image?: string;
    description?: string;
    attributes?: {
        trait_type: string;
        value: string;
    }[];
}
export interface TxItem {
    tx: Tx;
    code: number;
    events: Event[];
    txhash: string;
    timestamp: Date;
}
interface Tx {
    body: Body;
}
interface Body {
    memo: string;
    messages: Message[];
}
interface Message {
    "@type": string;
    [key: string]: unknown;
}
export type PaginatedResponse<T = unknown> = {
    pagination?: {
        next_key: string | null;
        total: string;
    };
} & T;
export declare function parsePaginatedResponse<T>(data: InfiniteData<PaginatedResponse<T>> | undefined, key: keyof T): {
    list: (NonNullable<PaginatedResponse<T>[keyof T]> extends infer T_1 ? T_1 extends NonNullable<PaginatedResponse<T>[keyof T]> ? T_1 extends readonly (infer InnerArr)[] ? InnerArr : T_1 : never : never)[];
    count: number;
};
export {};
