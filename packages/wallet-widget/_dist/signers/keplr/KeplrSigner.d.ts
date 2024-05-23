import { OfflineSigner } from '@cosmjs/proto-signing';
import { Keplr } from '@keplr-wallet/types';
import { Chain } from '@initia/initia-registry-types';
import { default as BaseSigner } from '../base/BaseSigner';

export default class KeplrSigner extends BaseSigner {
    protected chain: Chain;
    private wallet;
    constructor(chain: Chain, wallet: Keplr);
    private get chainInfo();
    protected getOfflineSigner(): Promise<OfflineSigner>;
    connect(): Promise<string>;
    disconnect(): Promise<void>;
    signArbitrary(data: string | Uint8Array): Promise<string>;
    verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean>;
}
