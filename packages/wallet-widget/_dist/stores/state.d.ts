import { BehaviorSubject } from 'rxjs';
import { Eip1193Provider } from 'ethers';
import { TxBodyValue } from '@initia/utils';
import { Chain } from '@initia/initia-registry-types';
import { Wallet } from '../shared/wallets';
import { default as BaseSigner } from '../signers/base/BaseSigner';

export declare const address$: BehaviorSubject<string>;
export declare const wallet$: BehaviorSubject<Wallet | null>;
export declare const signer$: BehaviorSubject<BaseSigner | null>;
export declare const ethereum$: BehaviorSubject<Eip1193Provider | null>;
interface Requested {
    layer: Chain;
    txBodyValue: TxBodyValue;
    gas: number | undefined;
    skipPollingTx: boolean;
    resolve: (value: string) => void;
    reject: (error: Error) => void;
}
type Opened = {
    component: "WalletList";
} | {
    component: "ConnectedWallet";
    style: string;
} | {
    component: "RequestTx";
    requested: Requested;
};
export declare const opened$: BehaviorSubject<Opened | null>;
export declare const isLoading$: BehaviorSubject<boolean>;
export {};
