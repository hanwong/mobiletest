import type { Eip1193Provider } from "ethers"
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing"
import type { OfflineAminoSigner } from "@cosmjs/amino"
import { encodeSecp256k1Pubkey, makeSignDoc } from "@cosmjs/amino"
import { fromBase64 } from "@cosmjs/encoding"
import { encodePubkey } from "@cosmjs/proto-signing"
import type { StdFee } from "@cosmjs/stargate"
import { assertDefined } from "@cosmjs/utils"
import { createAminoTypes, Data, type TxBodyValue } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import BaseSigner from "../base/BaseSigner"
import EthereumUtils from "./EthereumUtils"
import EthereumOfflineSigner from "./EthereumOfflineSigner"

const aminoTypes = createAminoTypes()

export default class EthereumSigner extends BaseSigner {
  protected declare offlineSigner?: OfflineAminoSigner
  private utils: EthereumUtils

  constructor(
    protected chain: Chain,
    public ethereum: Eip1193Provider,
  ) {
    super(chain)
    this.utils = new EthereumUtils(this.ethereum)
  }

  protected async getOfflineSigner(): Promise<OfflineAminoSigner> {
    return new EthereumOfflineSigner(this.utils)
  }

  public async signTx({ messages, memo = "" }: TxBodyValue, fee: StdFee): Promise<TxRaw> {
    const signingClient = await this.getSigningClient()
    const { registry } = signingClient
    const aminoMessages = messages.map((msg) => aminoTypes.toAmino(msg))
    const { address, pubkey } = await this.getAccount()
    const account = await signingClient.getAccount(address)
    if (!account) throw new Error("Account not found")
    const { accountNumber, sequence } = account
    const signDoc = makeSignDoc(aminoMessages, fee, this.chain.chain_id, memo, accountNumber, sequence)

    assertDefined(this.offlineSigner)
    const { signature } = await this.offlineSigner.signAmino(address, signDoc)

    const signedBody = TxBody.fromPartial({
      messages: messages.map((msg) => registry.encodeAsAny(msg)),
      memo: memo,
    })

    const signedAuthInfo = AuthInfo.fromPartial({
      signerInfos: [
        {
          publicKey: encodePubkey(encodeSecp256k1Pubkey(pubkey)),
          modeInfo: { single: { mode: SignMode.SIGN_MODE_EIP_191 } },
          sequence: BigInt(sequence),
        },
      ],
      fee: {
        amount: [...fee.amount],
        gasLimit: BigInt(fee.gas),
        granter: fee.granter,
        payer: fee.payer,
      },
    })

    const tx = TxRaw.fromPartial({
      bodyBytes: TxBody.encode(signedBody).finish(),
      authInfoBytes: AuthInfo.encode(signedAuthInfo).finish(),
      signatures: [fromBase64(signature.signature)],
    })

    return tx
  }

  public async disconnect(): Promise<void> {
    this.utils.clearCachedPublicKey()
    await super.disconnect()
  }

  public async signArbitrary(data: string | Uint8Array) {
    const signed = await this.utils.personalSign(new Data(data))
    return signed.prefixedHex
  }

  public async verifyArbitrary(data: string | Uint8Array, sig: string) {
    return this.utils.verifyMessage(new Data(data), sig)
  }
}
