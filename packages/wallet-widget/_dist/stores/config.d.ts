import { Chain } from '@initia/initia-registry-types';

interface ChainExtraInfo {
    omnitia: string;
    assetlist: string;
    swaplist: string;
    modules: {
        usernames: string;
        dex_utils: string;
        swap_transfer: string;
    };
}
interface Extra extends ChainExtraInfo {
    multiplier: number;
    web3authClientId: string;
    wcProjectId: string;
    useWalletAsSignerOnly: boolean;
    ethereumWalletsOnly: boolean;
}
export interface Config extends Partial<Extra> {
    layer: Chain;
}
export declare let layer: Chain;
export declare let omnitiaURL: string;
export declare let swaplistURL: string;
export declare let modules: {
    usernames: string;
    dex_utils: string;
    swap_transfer: string;
};
export declare let multiplier: number;
export declare let web3authClientId: string;
export declare let wcProjectId: string;
export declare let useWalletAsSignerOnly: boolean;
export declare let ethereumWalletsOnly: boolean;
export declare function updateConfig(config: Config): void;
export {};
