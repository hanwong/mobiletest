import type { FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { stringifyMessageValue, summarizeMessage } from "@initia/utils"
import { decodeTxBody } from "../../../scripts/cosmos/registry"
import { useTxConfirmContext } from "./context"
import ConfirmPage from "./ConfirmPage"
import ConfirmTxMetadata from "./ConfirmTxMetadata"
import ConfirmTxMessages from "./ConfirmTxMessages"
import ConfirmTxActions from "./ConfirmTxActions"
import ConfirmTxResult from "./ConfirmTxResult"

const ConfirmSignDocComponent = () => {
  const { sender, chainId, txBody, skipGasSimulation, approve, reject } = useTxConfirmContext()

  /* submit */
  const { mutate, data, isLoading, error, reset } = useMutation({
    mutationFn: () => approve(),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    mutate()
  }

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

  if (data) return <ConfirmTxResult txhash={data.transactionHash} />
  if (error instanceof Error) return <ConfirmTxResult error={error.message} onOk={reset} />

  return (
    <form onSubmit={submit}>
      <ConfirmPage title="Sign requested">
        <ConfirmTxMetadata {...metadata} />
        <ConfirmTxMessages messages={messages} />
        <ConfirmTxActions reject={reject} isLoading={isLoading} />
      </ConfirmPage>
    </form>
  )
}

export default ConfirmSignDocComponent
