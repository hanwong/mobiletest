import type { GeneratedType } from "@cosmjs/proto-signing"
import { MsgTransfer } from "@initia/initia.proto/ibc/applications/nft_transfer/v1/tx"
import { MsgExecute, MsgPublish, MsgScript } from "@initia/initia.proto/initia/move/v1/tx"
import { MsgWhitelist, MsgDelist, MsgUpdateParams } from "@initia/initia.proto/initia/move/v1/tx"
import { MsgGovExecute, MsgGovPublish, MsgGovScript } from "@initia/initia.proto/initia/move/v1/tx"
import { MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from "@initia/initia.proto/initia/mstaking/v1/tx"
import { MsgCreateValidator, MsgEditValidator } from "@initia/initia.proto/initia/mstaking/v1/tx"
import {
  MsgAddValidator,
  MsgExecuteMessages,
  MsgFinalizeTokenDeposit,
  MsgInitiateTokenWithdrawal,
  MsgRemoveValidator,
  MsgSpendFeePool,
  MsgUpdateParams as MsgUpdateOpChildParams,
} from "@initia/opinit.proto/opinit/opchild/v1/tx"
import {
  MsgCreateBridge,
  MsgDeleteOutput,
  MsgFinalizeTokenWithdrawal,
  MsgInitiateTokenDeposit,
  MsgProposeOutput,
  MsgRecordBatch,
  MsgUpdateChallenger,
  MsgUpdateParams as MsgUpdateOpHostParams,
  MsgUpdateProposer,
} from "@initia/opinit.proto/opinit/ophost/v1/tx"
import {
  MsgStoreCode,
  MsgInstantiateContract,
  MsgExecuteContract,
  MsgMigrateContract,
  MsgUpdateAdmin,
  MsgClearAdmin,
  MsgUpdateInstantiateConfig,
} from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { MsgCall, MsgCreate } from "@initia/initia.proto/minievm/evm/v1/tx"
import { MsgUpdateParams as MsgUpdateEvmParams } from "@initia/initia.proto/minievm/evm/v1/tx"
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "@initia/initia.proto/cosmos/gov/v1/tx"

interface Message {
  msg: GeneratedType
  aminoType: string
}

// prettier-ignore
const messages: Record<string, Message> = {
  /* move */
  "/initia.move.v1.MsgExecute": { msg: MsgExecute, aminoType: "move/MsgExecute" },
  "/initia.move.v1.MsgPublish": { msg: MsgPublish, aminoType: "move/MsgPublish" },
  "/initia.move.v1.MsgScript": { msg: MsgScript, aminoType: "move/MsgScript" },
  "/initia.move.v1.MsgUpdateParams": { msg: MsgUpdateParams, aminoType: "move/MsgUpdateParams" },
  "/initia.move.v1.MsgWhitelist": { msg: MsgWhitelist, aminoType: "move/MsgWhitelist" },
  "/initia.move.v1.MsgDelist": { msg: MsgDelist, aminoType: "move/MsgDelist" },
  "/initia.move.v1.MsgGovExecute": { msg: MsgGovExecute, aminoType: "move/MsgGovExecute" },
  "/initia.move.v1.MsgGovPublish": { msg: MsgGovPublish, aminoType: "move/MsgGovPublish" },
  "/initia.move.v1.MsgGovScript": { msg: MsgGovScript, aminoType: "move/MsgGovScript" },

  /* wasm */
  "/cosmwasm.wasm.v1.MsgStoreCode": { msg: MsgStoreCode, aminoType: "wasm/MsgStoreCode" },
  "/cosmwasm.wasm.v1.MsgInstantiateContract": { msg: MsgInstantiateContract, aminoType: "wasm/MsgInstantiateContract" },
  "/cosmwasm.wasm.v1.MsgExecuteContract": { msg: MsgExecuteContract, aminoType: "wasm/MsgExecuteContract" },
  "/cosmwasm.wasm.v1.MsgMigrateContract": { msg: MsgMigrateContract, aminoType: "wasm/MsgMigrateContract" },
  "/cosmwasm.wasm.v1.MsgUpdateAdmin": { msg: MsgUpdateAdmin, aminoType: "wasm/MsgUpdateAdmin" },
  "/cosmwasm.wasm.v1.MsgClearAdmin": { msg: MsgClearAdmin, aminoType: "wasm/MsgClearAdmin" },
  "/cosmwasm.wasm.v1.MsgUpdateInstantiateConfig": { msg: MsgUpdateInstantiateConfig, aminoType: "wasm/MsgUpdateInstantiateConfig" },

  /* evm */
  "/minievm.evm.v1.MsgCreate": { msg: MsgCreate, aminoType: "evm/MsgCreate" },
  "/minievm.evm.v1.MsgCall": { msg: MsgCall, aminoType: "evm/MsgCall" },
  "/minievm.evm.v1.MsgUpdateParams": { msg: MsgUpdateEvmParams, aminoType: "evm/MsgUpdateParams" },

  /* mstaking */
  "/initia.mstaking.v1.MsgDelegate": { msg: MsgDelegate, aminoType: "mstaking/MsgDelegate" },
  "/initia.mstaking.v1.MsgUndelegate": { msg: MsgUndelegate, aminoType: "mstaking/MsgUndelegate" },
  "/initia.mstaking.v1.MsgBeginRedelegate": { msg: MsgBeginRedelegate, aminoType: "mstaking/MsgBeginRedelegate" },
  "/initia.mstaking.v1.MsgCreateValidator": { msg: MsgCreateValidator, aminoType: "mstaking/MsgCreateValidator" },
  "/initia.mstaking.v1.MsgEditValidator": { msg: MsgEditValidator, aminoType: "mstaking/MsgEditValidator" },

  /* ibc */
  "/ibc.applications.nft_transfer.v1.MsgTransfer": { msg: MsgTransfer, aminoType: "nft-transfer/MsgTransfer" },

  /* op */
  "/opinit.opchild.v1.MsgAddValidator": { msg: MsgAddValidator, aminoType: "opchild/MsgAddValidator" },
  "/opinit.opchild.v1.MsgExecuteMessages": { msg: MsgExecuteMessages, aminoType: "opchild/MsgExecuteMessages" },
  "/opinit.opchild.v1.MsgFinalizeTokenDeposit": { msg: MsgFinalizeTokenDeposit, aminoType: "opchild/MsgFinalizeTokenDeposit" },
  "/opinit.opchild.v1.MsgInitiateTokenWithdrawal": { msg: MsgInitiateTokenWithdrawal, aminoType: "opchild/MsgInitiateTokenWithdrawal" },
  "/opinit.opchild.v1.MsgRemoveValidator": { msg: MsgRemoveValidator, aminoType: "opchild/MsgRemoveValidator" },
  "/opinit.opchild.v1.MsgSpendFeePool": { msg: MsgSpendFeePool, aminoType: "opchild/MsgSpendFeePool" },
  "/opinit.opchild.v1.MsgUpdateParams": { msg: MsgUpdateOpChildParams, aminoType: "opchild/MsgUpdateParams" },
  "/opinit.ophost.v1.MsgCreateBridge": { msg: MsgCreateBridge, aminoType: "ophost/MsgCreateBridge" },
  "/opinit.ophost.v1.MsgDeleteOutput": { msg: MsgDeleteOutput, aminoType: "ophost/MsgDeleteOutput" },
  "/opinit.ophost.v1.MsgFinalizeTokenWithdrawal": { msg: MsgFinalizeTokenWithdrawal, aminoType: "ophost/MsgFinalizeTokenWithdrawal" },
  "/opinit.ophost.v1.MsgInitiateTokenDeposit": { msg: MsgInitiateTokenDeposit, aminoType: "ophost/MsgInitiateTokenDeposit" },
  "/opinit.ophost.v1.MsgProposeOutput": { msg: MsgProposeOutput, aminoType: "ophost/MsgProposeOutput" },
  "/opinit.ophost.v1.MsgRecordBatch": { msg: MsgRecordBatch, aminoType: "ophost/MsgRecordBatch" },
  "/opinit.ophost.v1.MsgUpdateChallenger": { msg: MsgUpdateChallenger, aminoType: "ophost/MsgUpdateChallenger" },
  "/opinit.ophost.v1.MsgUpdateParams": { msg: MsgUpdateOpHostParams, aminoType: "ophost/MsgUpdateParams" },
  "/opinit.ophost.v1.MsgUpdateProposer": { msg: MsgUpdateProposer, aminoType: "ophost/MsgUpdateProposer" },

  /* gov */
  "/cosmos.gov.v1.MsgSubmitProposal": { msg: MsgSubmitProposal, aminoType: "cosmos-sdk/v1/MsgSubmitProposal" },
  "/cosmos.gov.v1.MsgDeposit": { msg: MsgDeposit, aminoType: "cosmos-sdk/v1/MsgDeposit" },
  "/cosmos.gov.v1.MsgVote": { msg: MsgVote, aminoType: "cosmos-sdk/v1/MsgVote" },
}

export default messages
