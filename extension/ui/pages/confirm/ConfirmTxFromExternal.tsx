import { useQueryClient } from "@tanstack/react-query"
import type { StdFee } from "@cosmjs/stargate"
import { request, useRequestedTx } from "../../background"
import { ConfirmTxContextProvider } from "./context"
import ConfirmTxContainer from "./ConfirmTxContainer"

const ConfirmTxFromExternal = () => {
  const requested = useRequestedTx()
  if (!requested) throw new Error("No tx to confirm")

  const queryClient = useQueryClient()

  const approve = async (fee?: StdFee) => {
    await request("approveRequestedTx", fee)
    await queryClient.invalidateQueries()
  }

  const reject = async () => {
    await request("rejectRequestedTx")
    await queryClient.invalidateQueries()
  }

  return (
    <ConfirmTxContextProvider value={{ ...requested, approve, reject }}>
      <ConfirmTxContainer />
    </ConfirmTxContextProvider>
  )
}

export default ConfirmTxFromExternal
