import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type { SwapPair } from "@initia/utils"
import { defaultChain } from "../../scripts/shared/chains"

export function useSwaplistQuery() {
  return useQuery({
    queryKey: [defaultChain.swaplist],
    queryFn: async () => {
      const { data } = await axios.get<Record<string, SwapPair>>(defaultChain.swaplist)
      return data
    },
    staleTime: Infinity,
  })
}

export function useSwaplist() {
  const { data = {} } = useSwaplistQuery()
  const pairs = useMemo(() => new Map(Object.entries(data)), [data])
  return pairs
}
