import type { EncodeObject } from "@cosmjs/proto-signing"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx"
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx"
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx"
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from "@initia/initia.proto/initia/mstaking/v1/tx"
import { MsgExecute } from "@initia/initia.proto/initia/move/v1/tx"
import Long from "long"

export function summarizeMessage({ typeUrl, value }: EncodeObject): [string, string] {
  switch (typeUrl) {
    /* cosmos: bank */
    case "/cosmos.bank.v1beta1.MsgSend":
      return ["Send", MsgSend.fromPartial(value).toAddress]

    /* cosmos: distribution */
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
      return ["Withdraw rewards", MsgWithdrawDelegatorReward.fromPartial(value).validatorAddress]

    /* cosmos: gov */
    case "/cosmos.gov.v1beta1.MsgSubmitProposal":
      return ["Submit proposal", MsgSubmitProposal.fromPartial(value).content?.typeUrl.split(".").at(-1) ?? ""]

    case "/cosmos.gov.v1beta1.MsgDeposit":
      return ["Deposit", MsgDeposit.fromPartial(value).proposalId.toString()]

    case "/cosmos.gov.v1beta1.MsgVote":
      return ["Vote", MsgVote.fromPartial(value).proposalId.toString()]

    /* cosmos:ibc */
    case "/ibc.core.client.v1.MsgUpdateClient":
      return ["Update client", ""]

    case "/ibc.core.channel.v1.MsgRecvPacket":
      return ["Recieve packet", ""]

    case "/ibc.applications.transfer.v1.MsgTransfer":
      return ["Send", MsgTransfer.fromPartial(value).receiver]

    /* initia */
    case "/initia.mstaking.v1.MsgDelegate":
      return ["Stake", MsgDelegate.fromPartial(value).validatorAddress]

    case "/initia.mstaking.v1.MsgUndelegate":
      return ["Unstake", MsgUndelegate.fromPartial(value).validatorAddress]

    case "/initia.mstaking.v1.MsgBeginRedelegate":
      return ["Move stake", MsgBeginRedelegate.fromPartial(value).validatorDstAddress]

    /* initia:move */
    case "/initia.move.v1.MsgExecute":
      return [
        `Execute ${MsgExecute.fromPartial(value).functionName ?? ""}`,
        MsgExecute.fromPartial(value).moduleAddress,
      ]

    default:
      return [typeUrl.split("Msg")[1], ""]
  }
}

export function stringifyMessageValue(value: unknown): string {
  if (Long.isLong(value)) {
    return value.toString()
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString("base64")
  }

  if (Array.isArray(value) && value.some((item) => item instanceof Uint8Array)) {
    return JSON.stringify(value.map((item) => stringifyMessageValue(item)))
  }

  if (value !== null && typeof value === "object") {
    return JSON.stringify(value)
  }

  return String(value)
}
