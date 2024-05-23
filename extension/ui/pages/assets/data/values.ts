import { useCallback, useEffect } from "react"
import { atomFamily, useRecoilValue, useSetRecoilState } from "recoil"
import { assocPath } from "ramda"
import BigNumber from "bignumber.js"

const layersValuesState = atomFamily<Record<string, Record<string, number>>, string>({
  key: "layersValues",
  default: {},
})

export function useGetLayerValue(address: string) {
  const layersValues = useRecoilValue(layersValuesState(address))
  return useCallback(
    (chainId: string) => {
      const layerValues = layersValues[chainId] || {}
      return BigNumber.sum(...Object.values(layerValues)).toNumber() || 0
    },
    [layersValues],
  )
}

export function useUpdateLayerValue({
  address,
  chainId,
  denom,
  value,
}: {
  address: string
  chainId: string
  denom: string
  value?: number
}) {
  const setLayerValues = useSetRecoilState(layersValuesState(address))
  useEffect(() => {
    if (value === undefined) return
    setLayerValues((prev) => assocPath([chainId, denom], value, prev))
  }, [chainId, denom, value, setLayerValues])
}
