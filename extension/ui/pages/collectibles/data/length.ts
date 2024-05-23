import { useCallback, useEffect } from "react"
import { atomFamily, useRecoilValue, useSetRecoilState } from "recoil"
import { assocPath } from "ramda"
import BigNumber from "bignumber.js"

/* collectibles */
const layersLengthState = atomFamily<Record<string, Record<string, number>>, string>({
  key: "layersLength",
  default: {},
})

export function useGetLayerLength(address: string) {
  const layersLength = useRecoilValue(layersLengthState(address))
  return useCallback(
    (chainId: string) => {
      const layerLengths = layersLength[chainId] || {}
      return BigNumber.sum(...Object.values(layerLengths)).toNumber() || 0
    },
    [layersLength],
  )
}

export function useUpdateLayerLength({
  address,
  chainId,
  collectionAddress,
  value,
}: {
  address: string
  chainId: string
  collectionAddress: string
  value?: number
}) {
  const setLayerLengths = useSetRecoilState(layersLengthState(address))
  useEffect(() => {
    if (value === undefined) return
    setLayerLengths((prev) => assocPath([chainId, collectionAddress], value, prev))
  }, [chainId, collectionAddress, value, setLayerLengths])
}
