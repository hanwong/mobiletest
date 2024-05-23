import { Eip1193Provider } from 'ethers';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { OfflineAminoSigner } from '@cosmjs/amino';
import { StdFee } from '@cosmjs/stargate';
import { TxBodyValue } from '@initia/utils';
import { Chain } from '@initia/initia-registry-types';
import { default as BaseSigner } from '../base/BaseSigner';

export default class EthereumSigner extends BaseSigner {
    protected chain: Chain;
    ethereum: Eip1193Provider;
    protected offlineSigner?: OfflineAminoSigner;
    private utils;
    constructor(chain: Chain, ethereum: Eip1193Provider);
    protected getOfflineSigner(): Promise<OfflineAminoSigner>;
    signTx({ messages, memo }: TxBodyValue, fee: StdFee): Promise<TxRaw>;
    disconnect(): Promise<void>;
    signArbitrary(data: string | Uint8Array): Promise<string>;
    verifyArbitrary(data: string | Uint8Array, sig: string): Promise<boolean>;
}
