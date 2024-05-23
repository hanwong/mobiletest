import { useQuery, useQueryClient } from "@tanstack/react-query"
import { StargateClientCache } from "@initia/utils"

export function useAllBalances(rpc: string, address?: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: [rpc, address, "Balances"],
    queryFn: async () => {
      if (!address) return []
      const client = await StargateClientCache.connect(rpc)
      const balances = await client.getAllBalances(address)
      return balances
    },
    onSuccess: (data) => {
      for (const { amount, denom } of data) {
        queryClient.setQueryData([rpc, address, "Balance", denom], amount)
      }
    },
  })
}

export function useBalance(rpc: string, address: string, denom: string) {
  return useQuery({
    queryKey: [rpc, address, "Balance", denom],
    queryFn: async () => {
      if (!address) return "0"
      const client = await StargateClientCache.connect(rpc)
      const coin = await client.getBalance(address, denom)
      return coin.amount
    },
  })
}
