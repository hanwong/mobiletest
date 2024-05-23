import { CHROM_WEB_STORE_URL } from "./constants"

export function findWallet(wallet: WalletNames) {
  return wallets.find((w) => w.name === wallet)
}

export interface Wallet {
  name: WalletNames
  logo?: string
  getShouldDownload?: () => boolean
  chromeWebStoreURL?: string
  loginProvider?: { label: string; value: string }
  isEthereumWallet?: boolean
  isSolanaWallet?: boolean
}

export enum WalletNames {
  /* native */
  Initia = "Initia Wallet",
  InitiaMobile = "Initia Mobile",
  InitiaWebView = "InitiaWebView",

  /* cosmos */
  Keplr = "Keplr",
  Leap = "Leap",

  /* ethereum */
  MetaMask = "Metamask",
  Rabby = "Rabby",

  /* solana */
  Phantom = "Phantom",

  /* social */
  Web3Auth = "Web3Auth",

  /* hardware */
  Ledger = "Cosmos Ledger App",
}

const wallets: Wallet[] = [
  {
    name: WalletNames.Initia,
    logo: "https://assets.initia.xyz/images/wallets/Initia.webp",
    getShouldDownload: () => !window.initia,
    chromeWebStoreURL: CHROM_WEB_STORE_URL + "ffbceckpkpbcmgiaehlloocglmijnpmp",
  },
  {
    name: WalletNames.InitiaMobile,
    logo: "https://assets.initia.xyz/images/wallets/Initia.webp",
  },
  {
    name: WalletNames.Keplr,
    logo: "https://assets.initia.xyz/images/wallets/Keplr.webp",
    getShouldDownload: () => !window.keplr,
    chromeWebStoreURL: CHROM_WEB_STORE_URL + "dmkamcknogkgcdfhhbddcghachkejeap",
  },
  {
    name: WalletNames.Leap,
    logo: "https://assets.initia.xyz/images/wallets/Leap.webp",
    getShouldDownload: () => !window.leap,
    chromeWebStoreURL: CHROM_WEB_STORE_URL + "fcfcfllfndlomdhbehjjcoimbgofdncg",
  },
  {
    name: WalletNames.MetaMask,
    logo: "https://assets.initia.xyz/images/wallets/MetaMask.webp",
    getShouldDownload: () => !(window.ethereum && window.ethereum.isMetaMask),
    chromeWebStoreURL: CHROM_WEB_STORE_URL + "nkbihfbeogaeaoehlefnkodbefgpgknn",
    isEthereumWallet: true,
  },
  {
    name: WalletNames.Rabby,
    logo: "https://assets.initia.xyz/images/wallets/Rabby.webp",
    getShouldDownload: () => !(window.ethereum && window.ethereum.isRabby),
    chromeWebStoreURL: CHROM_WEB_STORE_URL + "acmacodkjbdgmoleebolmdjonilkdbch",
    isEthereumWallet: true,
  },
  {
    name: WalletNames.Phantom,
    logo: "https://assets.initia.xyz/images/wallets/Phantom.webp",
    getShouldDownload: () => !(window.solana && window.solana.isPhantom),
    chromeWebStoreURL: CHROM_WEB_STORE_URL + "bfnaelmomeimhlpmgjnjophhpkkoljpa",
    isSolanaWallet: true,
  },
  {
    name: WalletNames.Web3Auth,
    logo: "https://assets.initia.xyz/images/social/google.png",
    loginProvider: { label: "Google", value: "google" },
  },
  {
    name: WalletNames.Web3Auth,
    logo: "https://assets.initia.xyz/images/social/twitter.png",
    loginProvider: { label: "Twitter", value: "twitter" },
  },
  {
    name: WalletNames.Web3Auth,
    logo: "https://assets.initia.xyz/images/social/discord.png",
    loginProvider: { label: "Discord", value: "discord" },
  },
  {
    name: WalletNames.Ledger,
    logo: "https://assets.initia.xyz/images/wallets/Ledger.webp",
  },
]

export default wallets
