import { Eip1193Provider } from 'ethers';
import { Chain } from '@initia/initia-registry-types';
import { default as EthereumSigner } from '../ethereum/EthereumSigner';
import { default as Web3AuthConnector } from './Web3AuthConnector';

export default class Web3AuthSigner extends EthereumSigner {
    protected chain: Chain;
    ethereum: Eip1193Provider;
    private connector;
    constructor(chain: Chain, ethereum: Eip1193Provider, connector: Web3AuthConnector);
    disconnect(): Promise<void>;
}
