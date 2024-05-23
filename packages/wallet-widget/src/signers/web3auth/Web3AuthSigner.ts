import type { Eip1193Provider } from "ethers"
import type { Chain } from "@initia/initia-registry-types"
import EthereumSigner from "../ethereum/EthereumSigner"
import type Web3AuthConnector from "./Web3AuthConnector"

export default class Web3AuthSigner extends EthereumSigner {
  constructor(
    protected chain: Chain,
    public ethereum: Eip1193Provider,
    private connector: Web3AuthConnector,
  ) {
    super(chain, ethereum)
  }

  public async disconnect(): Promise<void> {
    await this.connector.disconnect()
    await super.disconnect()
  }
}
