import { Wallet } from './shared/wallets';
import { disconnect, openWalletList, requestTx, requestInitiaTx, signArbitrary, verifyArbitrary, viewConnectedWallet } from './stores/actions';
import { Config } from './stores/config';

export type { Config } from './stores/config';
export type { Wallet } from './shared/wallets';
declare const widget: {
    address$: import('rxjs').BehaviorSubject<string>;
    wallet$: import('rxjs').BehaviorSubject<Wallet | null>;
    ethereum$: import('rxjs').BehaviorSubject<import('ethers').Eip1193Provider | null>;
    isLoading$: import('rxjs').BehaviorSubject<boolean>;
    onboard: typeof openWalletList;
    view: typeof viewConnectedWallet;
    requestTx: typeof requestTx;
    requestInitiaTx: typeof requestInitiaTx;
    signArbitrary: typeof signArbitrary;
    verifyArbitrary: typeof verifyArbitrary;
    disconnect: typeof disconnect;
};
export type WalletWidget = typeof widget;
declare function init(config: Config): {
    address$: import('rxjs').BehaviorSubject<string>;
    wallet$: import('rxjs').BehaviorSubject<Wallet | null>;
    ethereum$: import('rxjs').BehaviorSubject<import('ethers').Eip1193Provider | null>;
    isLoading$: import('rxjs').BehaviorSubject<boolean>;
    onboard: typeof openWalletList;
    view: typeof viewConnectedWallet;
    requestTx: typeof requestTx;
    requestInitiaTx: typeof requestInitiaTx;
    signArbitrary: typeof signArbitrary;
    verifyArbitrary: typeof verifyArbitrary;
    disconnect: typeof disconnect;
};
export default init;
