import { GasPrice } from '@cosmjs/stargate';
import { Asset, Chain } from '@initia/initia-registry-types';

export declare function toGasPrice(layer: Chain, denom: string): GasPrice;
export declare function getLogo(asset?: Asset): string | undefined;
export declare function getDecimals(asset?: Asset): number | undefined;
export default class InitiaLayer {
    private layer;
    private static instances;
    pairs: Record<string, string>;
    assets: Asset[];
    private constructor();
    private get is_l1();
    static initialize(layer: Chain): Promise<InitiaLayer>;
    static getInstance(chainId: string): InitiaLayer;
    private init;
    private fetchPairs;
    private fetchAssets;
    findAsset(denom: string): Asset | undefined;
}
