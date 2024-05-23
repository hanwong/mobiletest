export default class Web3AuthConnector {
    private clientId;
    private web3auth;
    private adapter;
    constructor(clientId: string);
    init(): Promise<void>;
    get provider(): import('@web3auth/base').IProvider | null | undefined;
    connectTo(loginProvider: string): Promise<import('@web3auth/base').IProvider | null>;
    disconnect(): Promise<void>;
}
