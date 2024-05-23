import { OfflineSigner } from '@cosmjs/proto-signing';
import { Chain } from '@initia/initia-registry-types';
import { default as BaseSigner } from '../base/BaseSigner';

export default class InitiaWebViewSigner extends BaseSigner {
    protected chain: Chain;
    private wallet;
    constructor(chain: Chain);
    protected getOfflineSigner(): Promise<OfflineSigner>;
    signArbitrary(): Promise<string>;
    verifyArbitrary(): Promise<boolean>;
}
