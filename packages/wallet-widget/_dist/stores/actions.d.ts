import { TxBodyValue } from '@initia/utils';
import { Chain } from '@initia/initia-registry-types';
import { Msg } from '@initia/initia.js';
import { Wallet } from '../shared/wallets';
import { default as InitiaSigner } from '../signers/initia/InitiaSigner';
import { default as InitiaMobileSigner } from '../signers/initia/InitiaMobileSigner';
import { default as InitiaWebViewSigner } from '../signers/initia/InitiaWebViewSigner';
import { default as KeplrSigner } from '../signers/keplr/KeplrSigner';
import { default as EthereumSigner } from '../signers/ethereum/EthereumSigner';
import { default as LedgerSigner } from '../signers/ledger/LedgerSigner';

export declare function openWalletList(): void;
export declare function viewConnectedWallet(event?: MouseEvent): void;
export declare function close(): void;
export declare function requestInitiaTx({ msgs, memo }: {
    msgs: Msg[];
    memo?: string;
}, gas?: number): Promise<string>;
export declare function requestTx(txBodyValue: TxBodyValue, gas?: number): Promise<string>;
export declare function signArbitrary(data: string | Uint8Array): Promise<string>;
export declare function verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean>;
export declare function getSigner({ name, loginProvider }: Wallet, chain: Chain, useExistingProvider?: boolean): Promise<InitiaSigner | InitiaMobileSigner | InitiaWebViewSigner | KeplrSigner | EthereumSigner | LedgerSigner>;
export declare function connect(wallet: Wallet, connectingLastWallet?: boolean): Promise<void>;
export declare function disconnect(): Promise<void>;
