import { OfflineSigner } from '@cosmjs/proto-signing';
import { Chain } from '@initia/initia-registry-types';
import { default as BaseSigner } from '../base/BaseSigner';

export default class InitiaSigner extends BaseSigner {
    protected chain: Chain;
    private wallet;
    constructor(chain: Chain);
    protected getOfflineSigner(): Promise<OfflineSigner>;
    signAndBroadcastSync(chainId: string, tx: Uint8Array): Promise<string>;
    signAndBroadcastBlock(chainId: string, tx: Uint8Array): Promise<string>;
    signArbitrary(data: string | Uint8Array): Promise<string>;
    verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean>;
    requestAddInitiaLayer(layer: Chain): Promise<void>;
}
