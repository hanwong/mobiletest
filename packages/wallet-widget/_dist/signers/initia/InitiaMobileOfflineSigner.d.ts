import { OfflineDirectSigner, DirectSignResponse } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { AccountData } from '@keplr-wallet/types';
import { default as SignClient } from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';

export default class InitiaMobileOfflineSigner implements OfflineDirectSigner {
    private readonly signClient;
    private readonly session;
    private readonly chainId;
    constructor(signClient: SignClient, session: SessionTypes.Struct, chainId: string);
    getAccounts(): Promise<AccountData[]>;
    signDirect(signerAddress: string, signDoc: SignDoc): Promise<DirectSignResponse>;
}
