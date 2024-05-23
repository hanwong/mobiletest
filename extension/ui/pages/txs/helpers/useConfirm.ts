import { useNavigate } from "react-router-dom"
import type { TxBodyValue } from "@initia/utils"
import { encode } from "@initia/utils"
import registry from "../../../../scripts/cosmos/registry"

export default function useConfirm() {
  const navigate = useNavigate()
  return (txBodyValue: TxBodyValue, chainId?: string | number) => {
    navigate("/confirm", { state: { chainId, txBodyValue: encode(registry.encodeTxBody(txBodyValue)) } })
  }
}
