import { useEffect, useMemo } from "react"
import { FormProvider, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { useMutation } from "@tanstack/react-query"
import {
  CoinSchema,
  TimeoutError,
  defined,
  getGasPrice,
  getRPC,
  required,
  stringifyMessageValue,
  summarizeMessage,
} from "@initia/utils"
import { useAllBalances } from "../../data/interchain"
import { DEFAULT_GAS_ADJUSTMENT } from "../../../scripts/shared/constants"
import { decodeTxBody } from "../../../scripts/cosmos/registry"
import { useAddress, useFindLayer, usePreferences } from "../../background"
import { useGasPricesQuery, useGasSimulation } from "./data"
import { useTxConfirmContext } from "./context"
import ConfirmPage from "./ConfirmPage"
import ConfirmTxMetadata from "./ConfirmTxMetadata"
import ConfirmTxMessages from "./ConfirmTxMessages"
import ConfirmTxActions from "./ConfirmTxActions"
import ConfirmTxResult from "./ConfirmTxResult"

const ConfirmTxComponent = () => {
  const address = useAddress()
  const { sender, chainId, txBody, skipGasSimulation, approve, reject } = useTxConfirmContext()

  const layer = useFindLayer(chainId)
  const { gasAdjustment } = usePreferences()
  defined(layer, "Layer not found")
  const { data: balances = [] } = useAllBalances(getRPC(layer), address)

  const initialFeeDenom = useMemo(() => {
    const storedFeeDenom = localStorage.getItem("feeDenom")

    if (storedFeeDenom && layer?.fees?.fee_tokens.some((item) => item.denom === storedFeeDenom)) {
      return storedFeeDenom
    }

    const initialFeeToken = layer?.fees?.fee_tokens.find((feeToken) =>
      balances.some((balance) => BigNumber(balance.amount).gt(0) && balance.denom === feeToken.denom),
    )

    if (initialFeeToken) {
      return initialFeeToken.denom
    }

    if (layer?.fees?.fee_tokens[0]) {
      return layer?.fees?.fee_tokens[0].denom
    }

    throw new Error("No fee token found")
  }, [balances, layer])

  /* form */
  const form = useForm({ defaultValues: { feeDenom: initialFeeDenom } })
  const { handleSubmit, watch } = form
  const feeDenom = watch("feeDenom") || ""

  const { data: gasPrices = {} } = useGasPricesQuery(required(layer))
  const gasPrice = useMemo(() => {
    return getGasPrice(feeDenom, layer, gasPrices)
  }, [layer, gasPrices, feeDenom])

  useEffect(() => {
    if (feeDenom) {
      localStorage.setItem("feeDenom", feeDenom)
    }
  }, [feeDenom])

  /* estimate fee */
  const isFreeTx = useMemo(() => {
    if (!layer) return false
    const freeTxThreshold = layer.metadata?.free_tx_threshold
    if (!freeTxThreshold) return false
    return balances.some((balance) =>
      freeTxThreshold.some(
        (threshold) => balance.denom === threshold.denom && BigNumber(balance.amount).gte(threshold.amount),
      ),
    )
  }, [balances, layer])

  const gasSimulation = useGasSimulation()
  const { data: estimatedGas } = gasSimulation

  const adjustedGas = useMemo(() => {
    if (!estimatedGas) return
    return ceil(estimatedGas * (gasAdjustment ?? DEFAULT_GAS_ADJUSTMENT))
  }, [estimatedGas, gasAdjustment])

  const baseFeeAmount = useMemo(() => {
    if (!adjustedGas) return
    return BigNumber(adjustedGas).times(gasPrice).integerValue(BigNumber.ROUND_CEIL).toString()
  }, [adjustedGas, gasPrice])

  const feeAmount = useMemo(() => {
    if (isFreeTx) return "0"
    if (!baseFeeAmount) return
    if (!feeDenom) return
    if (feeDenom === initialFeeDenom) return baseFeeAmount
    return baseFeeAmount
  }, [baseFeeAmount, feeDenom, initialFeeDenom, isFreeTx])

  const fee = useMemo(() => ({ amount: feeAmount, denom: feeDenom }), [feeAmount, feeDenom])

  /* check if balance is enough to pay fee */
  const isEnough = useMemo(() => {
    if (!fee.amount) return
    const balance = balances.find((coin) => coin.denom === fee.denom)?.amount ?? "0"
    return BigNumber(balance).gte(fee.amount)
  }, [balances, fee])

  /* submit */
  const { mutate, data, isLoading, error, reset } = useMutation({
    mutationFn: async () => {
      if (skipGasSimulation) return approve()
      if (!adjustedGas) throw new Error("Gas not estimated")
      return approve({ amount: [CoinSchema.parse(fee)], gas: ceil(adjustedGas) })
    },
  })

  /* render */
  const { memo, ...decoded } = decodeTxBody(txBody)
  const metadata = { sender, chainId, skipGasSimulation, memo }
  const messages = decoded.messages.map(({ typeUrl, value }) => {
    const [title, description] = summarizeMessage({ typeUrl, value })
    const details = Object.entries(value)
      .filter(([key]) => key !== "sender")
      .map(([key, value]) => ({ title: key, content: stringifyMessageValue(value) }))
    return { title, description, details }
  })

  const feeContext = useMemo(() => ({ gasSimulation, fee, isEnough }), [fee, gasSimulation, isEnough])

  if (error instanceof TimeoutError) {
    return <ConfirmTxResult txhash={error.transactionHash} layer={layer} error={error.message} onOk={reset} />
  }

  if (error instanceof Error) {
    return <ConfirmTxResult error={error.message} onOk={reset} />
  }

  if (data) {
    return <ConfirmTxResult txhash={data.transactionHash} layer={layer} />
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(() => mutate())}>
        <ConfirmPage title="Tx requested">
          <ConfirmTxMetadata {...metadata} feeContext={feeContext} />
          <ConfirmTxMessages messages={messages} />
          <ConfirmTxActions
            reject={reject}
            isLoading={isLoading}
            disabled={gasSimulation.isLoading || gasSimulation.isError}
          />
        </ConfirmPage>
      </form>
    </FormProvider>
  )
}

export default ConfirmTxComponent

function ceil(n: BigNumber.Value) {
  return BigNumber(n).integerValue(BigNumber.ROUND_CEIL).toString()
}
