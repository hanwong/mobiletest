import { request, useRequestedSignDoc } from "../../background"
import { ConfirmTxContextProvider } from "./context"
import ConfirmSignDocComponent from "./ConfirmSignDocComponent"

const ConfirmSignDoc = () => {
  const requested = useRequestedSignDoc()
  if (!requested) throw new Error("No tx to confirm")

  const txBody = requested.signDoc.bodyBytes
  const approve = () => request("approveRequestedSignDoc")
  const reject = () => request("rejectRequestedSignDoc")

  return (
    <ConfirmTxContextProvider value={{ ...requested, txBody, skipGasSimulation: true, approve, reject }}>
      <ConfirmSignDocComponent />
    </ConfirmTxContextProvider>
  )
}

export default ConfirmSignDoc
