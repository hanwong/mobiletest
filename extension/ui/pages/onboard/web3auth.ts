import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base"
import { Web3AuthNoModal } from "@web3auth/no-modal"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { API_KEY } from "../../../scripts/shared/constants"

const clientId = API_KEY.WEB3AUTH

export async function requestUserInfo(loginProvider: string) {
  const chainConfig = {
    chainId: "0x1",
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    displayName: "Ethereum",
    rpcTarget: "https://rpc.ankr.com/eth",
    blockExplorer: "https://etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
  }

  const web3auth = new Web3AuthNoModal({
    clientId,
    chainConfig,
    web3AuthNetwork: "sapphire_mainnet",
  })

  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } })
  const adapter = new OpenloginAdapter({ privateKeyProvider })
  web3auth.configureAdapter(adapter)

  await web3auth.init()
  if (web3auth.status === "connected") await adapter.disconnect()
  const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, { loginProvider })
  if (!web3authProvider) throw new Error("Web3Auth provider not found")
  const privateKey = (await web3authProvider.request({ method: "private_key" })) as string
  const { name, email } = await web3auth.getUserInfo()
  return { name, email, privateKey }
}
