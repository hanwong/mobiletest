import { OfflineAminoSigner } from '@keplr-wallet/types';
import { Chain } from '@initia/initia-registry-types';
import { default as BaseSigner } from '../base/BaseSigner';

export default class LedgerSigner extends BaseSigner {
    protected chain: Chain;
    private static transport;
    constructor(chain: Chain);
    private getTransport;
    protected getOfflineSigner(): Promise<OfflineAminoSigner>;
    disconnect(): Promise<void>;
    signArbitrary(): Promise<string>;
    verifyArbitrary(): Promise<boolean>;
}
