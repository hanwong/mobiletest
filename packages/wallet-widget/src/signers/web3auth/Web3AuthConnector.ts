import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base"
import { Web3AuthNoModal } from "@web3auth/no-modal"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"

export default class Web3AuthConnector {
  private web3auth: Web3AuthNoModal
  private adapter: OpenloginAdapter

  constructor(private clientId: string) {
    const chainConfig = {
      chainId: "0x1",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      displayName: "Ethereum",
      rpcTarget: "https://rpc.ankr.com/eth",
      blockExplorer: "https://etherscan.io",
      ticker: "ETH",
      tickerName: "Ethereum",
    }

    this.web3auth = new Web3AuthNoModal({
      clientId: this.clientId,
      chainConfig,
      web3AuthNetwork: "sapphire_mainnet",
    })

    const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } })
    this.adapter = new OpenloginAdapter({ privateKeyProvider })
    this.web3auth.configureAdapter(this.adapter)
  }

  public async init() {
    await this.web3auth.init()
  }

  public get provider() {
    if (this.web3auth.connected) {
      return this.web3auth.provider
    }
  }

  public async connectTo(loginProvider: string) {
    return this.provider ?? this.web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, { loginProvider })
  }

  public async disconnect() {
    await this.adapter.disconnect()
  }
}
