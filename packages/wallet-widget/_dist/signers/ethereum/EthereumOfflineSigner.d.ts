import { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignDoc } from '@cosmjs/amino';
import { default as EthereumUtils } from './EthereumUtils';

export default class EthereumOfflineSigner implements OfflineAminoSigner {
    private utils;
    constructor(utils: EthereumUtils);
    private deriveAddressFromPublicKey;
    private fetchAddress;
    private sign;
    getAccounts(): Promise<readonly AccountData[]>;
    signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse>;
}
