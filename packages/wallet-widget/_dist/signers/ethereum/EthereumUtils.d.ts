import { Eip1193Provider, SignatureLike } from 'ethers';
import { Data } from '@initia/utils';

export default class EthereumUtils {
    private provider;
    constructor(ethereum: Eip1193Provider);
    personalSign(message: Data): Promise<Data>;
    verifyMessage(message: Data, sig: SignatureLike): Promise<boolean>;
    fetchPublicKey(): Promise<Data>;
    clearCachedPublicKey(): void;
    recoverPublicKey(message: Data, signature: Data): Data;
}
