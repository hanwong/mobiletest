import { atom, useRecoilValue } from "recoil"
import { required } from "@initia/utils"
import { defaultChain } from "../../../scripts/shared/chains"
import { useFindLayer } from "../../background"

export const activityLayerState = atom({
  key: "activityLayer",
  default: defaultChain.chainId,
})

export function useActivityLayer() {
  const activityLayer = useRecoilValue(activityLayerState)
  const layer = useFindLayer(activityLayer)
  return required(layer, "Layer not found")
}
