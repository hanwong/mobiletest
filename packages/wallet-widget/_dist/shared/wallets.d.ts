export declare function findWallet(wallet: WalletNames): Wallet | undefined;
export interface Wallet {
    name: WalletNames;
    logo?: string;
    getShouldDownload?: () => boolean;
    chromeWebStoreURL?: string;
    loginProvider?: {
        label: string;
        value: string;
    };
    isEthereumWallet?: boolean;
    isSolanaWallet?: boolean;
}
export declare enum WalletNames {
    Initia = "Initia Wallet",
    InitiaMobile = "Initia Mobile",
    InitiaWebView = "InitiaWebView",
    Keplr = "Keplr",
    Leap = "Leap",
    MetaMask = "Metamask",
    Rabby = "Rabby",
    Phantom = "Phantom",
    Web3Auth = "Web3Auth",
    Ledger = "Cosmos Ledger App"
}
declare const wallets: Wallet[];
export default wallets;
