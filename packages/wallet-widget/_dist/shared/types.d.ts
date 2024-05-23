import { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { Keplr } from '@keplr-wallet/types';
import { Chain } from '@initia/initia-registry-types';

export interface InitiaWallet {
    getVersion: () => Promise<string>;
    getAddress: (chainId: string) => Promise<string>;
    signAndBroadcastSync: (chainId: string, txBody: Uint8Array) => Promise<string>;
    signAndBroadcastBlock: (chainId: string, txBody: Uint8Array) => Promise<DeliverTxResponse>;
    signAndBroadcast: (chainId: string, txBody: Uint8Array) => Promise<DeliverTxResponse>;
    getOfflineSigner: (chainId: string) => OfflineDirectSigner;
    requestAddInitiaLayer: (chain: Partial<Chain>) => Promise<void>;
    signArbitrary: (data: string | Uint8Array) => Promise<string>;
    verifyArbitrary: (data: string | Uint8Array, signature: string) => Promise<boolean>;
}
export interface InitiaWebViewWallet {
    getOfflineSigner: (chainId: string) => OfflineSigner;
    emit?: (event: string, data: unknown) => void;
}
declare global {
    interface Window {
        initia?: InitiaWallet;
        initiaWebView?: InitiaWebViewWallet;
        keplr?: Keplr;
        leap?: Keplr;
        ethereum?: any;
        solana?: any;
    }
}
