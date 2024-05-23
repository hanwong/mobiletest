import { encodeSecp256k1Pubkey } from "@cosmjs/amino"
import { type OfflineSigner } from "@cosmjs/proto-signing"
import type { ChainInfo, FeeCurrency, Keplr } from "@keplr-wallet/types"
import { getRPC, getRest, required } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { OmnitiaQueries } from "../../shared/queries"
import InitiaLayer, { getDecimals } from "../../layers/InitiaLayer"
import BaseSigner from "../base/BaseSigner"

export default class KeplrSigner extends BaseSigner {
  constructor(
    protected chain: Chain,
    private wallet: Keplr,
  ) {
    super(chain)
  }

  private get chainInfo(): ChainInfo {
    const initiaLayer = InitiaLayer.getInstance(this.chain.chain_id)

    const feeCurrencies = required(this.chain.fees, "Fees are required")
      .fee_tokens.map(({ denom, low_gas_price, average_gas_price, high_gas_price, fixed_min_gas_price }) => {
        const asset = initiaLayer.findAsset(denom)
        const decimals = getDecimals(asset) ?? 0

        const defaultGasPrice = fixed_min_gas_price ?? average_gas_price

        const gasPriceStep = !defaultGasPrice
          ? undefined
          : {
              low: low_gas_price ?? defaultGasPrice,
              average: average_gas_price ?? defaultGasPrice,
              high: high_gas_price ?? defaultGasPrice,
            }

        return {
          coinDenom: asset?.symbol ?? denom,
          coinMinimalDenom: denom,
          coinDecimals: decimals,
          gasPriceStep,
        } as FeeCurrency
      })
      .filter(({ gasPriceStep }) => gasPriceStep)

    return {
      chainName: this.chain.chain_name,
      chainId: this.chain.chain_id,
      rpc: getRPC(this.chain),
      rest: getRest(this.chain),
      currencies: feeCurrencies,
      feeCurrencies,
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: "init",
        bech32PrefixAccPub: "initpub",
        bech32PrefixValAddr: "initvaloper",
        bech32PrefixValPub: "initvaloperpub",
        bech32PrefixConsAddr: "initvalcons",
        bech32PrefixConsPub: "initvalconspub",
      },
    }
  }

  protected async getOfflineSigner(): Promise<OfflineSigner> {
    return this.wallet.getOfflineSigner(this.chain.chain_id)
  }

  public async connect(): Promise<string> {
    await OmnitiaQueries.initialize()
    await InitiaLayer.initialize(this.chain)

    try {
      await this.wallet.enable(this.chain.chain_id)
    } catch {
      await this.wallet.experimentalSuggestChain(this.chainInfo)
      await this.wallet.enable(this.chain.chain_id)
    }

    return super.connect()
  }

  public async disconnect(): Promise<void> {
    try {
      await this.wallet.disable(this.chain.chain_id)
      await super.disconnect()
    } catch {
      await super.disconnect()
    }
  }

  public async signArbitrary(data: string | Uint8Array): Promise<string> {
    const { signature } = await this.wallet.signArbitrary(this.chain.chain_id, await this.getAddress(), data)
    return signature
  }

  public async verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean> {
    const { pubkey } = await this.getAccount()
    const pub_key = encodeSecp256k1Pubkey(pubkey)
    return this.wallet.verifyArbitrary(this.chain.chain_id, await this.getAddress(), data, { pub_key, signature })
  }
}
