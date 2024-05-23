import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { StdFee } from '@cosmjs/amino';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate';
import { AccountData } from '@keplr-wallet/types';
import { TxBodyValue } from '@initia/utils';
import { Chain } from '@initia/initia-registry-types';

export default abstract class BaseSigner {
    protected chain: Chain;
    protected abstract getOfflineSigner(): Promise<OfflineSigner>;
    protected offlineSigner?: OfflineSigner;
    stargateClient?: SigningStargateClient;
    constructor(chain: Chain);
    getAccount(): Promise<AccountData>;
    getAddress(): Promise<string>;
    protected getSigningClient(): Promise<SigningStargateClient>;
    connect(): Promise<string>;
    disconnect(): Promise<void>;
    estimateGas({ messages, memo }: TxBodyValue): Promise<number>;
    signTx({ messages, memo }: TxBodyValue, fee: StdFee): Promise<TxRaw>;
    broadcastTx(txRaw: TxRaw): Promise<string>;
    pollTx(transactionHash: string, maxRetries?: number): Promise<DeliverTxResponse>;
    abstract signArbitrary(data: string | Uint8Array): Promise<string>;
    abstract verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean>;
}
