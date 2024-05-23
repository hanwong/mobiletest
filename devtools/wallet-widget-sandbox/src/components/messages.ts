import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { MsgExecute } from "@initia/initia.proto/initia/move/v1/tx"
import { bcs } from "@initia/utils"

function send({ address, recipientAddress, denom }: { address: string; recipientAddress: string; denom: string }) {
  return [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.fromPartial({
        fromAddress: address,
        toAddress: recipientAddress,
        amount: [{ denom, amount: String(1e6) }],
      }),
    },
  ]
}

const INIT_USDC_PAIR = "0xdbf06c48af3984ec6d9ae8a9aa7dbb0bb1e784aa9b8c4a5681af660cf8558d7d"
const INIT_METADATA = "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9"

function swap(address: string) {
  return [
    {
      typeUrl: "/initia.move.v1.MsgExecute",
      value: MsgExecute.fromPartial({
        sender: address,
        moduleAddress: "0x1",
        moduleName: "dex",
        functionName: "swap_script",
        typeArgs: [],
        args: [
          bcs.address().serialize(INIT_USDC_PAIR).toBytes(),
          bcs.address().serialize(INIT_METADATA).toBytes(),
          bcs.u64().serialize(String(1e6)).toBytes(),
          bcs.option(bcs.u64()).serialize(null).toBytes(),
        ],
      }),
    },
  ]
}

export const TxMessages = {
  send,
  swap,
}
