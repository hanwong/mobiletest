import type { FormEvent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { request, useRequestedArbitrary } from "../../background"
import ConfirmPage from "./ConfirmPage"
import ConfirmTxMetadata from "./ConfirmTxMetadata"
import ConfirmTxActions from "./ConfirmTxActions"
import ConfirmArbitraryData from "./ConfirmArbitraryData"

const ConfirmArbitrary = () => {
  const requested = useRequestedArbitrary()
  if (!requested) throw new Error("No data to sign")

  const { sender, data } = requested

  const queryClient = useQueryClient()

  const approve = async () => {
    await request("approveRequestedArbitrary")
    await queryClient.invalidateQueries()
  }

  const reject = async () => {
    await request("rejectRequestedArbitrary")
    await queryClient.invalidateQueries()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    approve()
  }

  const metadata = { sender }

  return (
    <form onSubmit={submit}>
      <ConfirmPage title="Sign requested">
        <ConfirmTxMetadata {...metadata} />
        <ConfirmArbitraryData data={data} />
        <ConfirmTxActions reject={reject} />
      </ConfirmPage>
    </form>
  )
}

export default ConfirmArbitrary
