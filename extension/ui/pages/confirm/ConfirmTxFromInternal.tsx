import { useLocation, useNavigate } from "react-router-dom"
import type { StdFee } from "@cosmjs/stargate"
import { decode } from "@initia/utils"
import { defaultChain } from "../../../scripts/shared/chains"
import { request } from "../../background"
import { ConfirmTxContextProvider } from "./context"
import ConfirmTxContainer from "./ConfirmTxContainer"

const ConfirmTxFromInternal = () => {
  const navigate = useNavigate()
  const chain = defaultChain
  const { state } = useLocation()
  if (!state) throw new Error("No tx to confirm")

  const chainId = state.chainId ?? chain.chainId
  const txBody = decode<Uint8Array>(state.txBodyValue)

  const approve = (fee?: StdFee) => {
    if (!fee) throw new Error("No fee provided")
    return request("signAndBroadcastCosmosTx", { chainId, txBody, fee })
  }

  const reject = () => navigate(-1)

  return (
    <ConfirmTxContextProvider value={{ txBody, chainId, approve, reject }}>
      <ConfirmTxContainer />
    </ConfirmTxContextProvider>
  )
}

export default ConfirmTxFromInternal
