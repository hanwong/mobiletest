import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { createInitiaMoveClient, getRest } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import type { InitiaTokenInfo } from "../data/tokens"

interface Props {
  layer: Chain
  metadata: string
  children: (tokenInfo: InitiaTokenInfo) => ReactNode
  fallback?: ReactNode
}

const WithTokenInfo = ({ layer, metadata, fallback, children }: Props) => {
  const client = createInitiaMoveClient(getRest(layer))

  const { data, isLoading, isError } = useQuery({
    queryKey: [client.rest, metadata, "TokenInfo"],
    queryFn: async (): Promise<InitiaTokenInfo | null> => {
      if (layer.metadata?.minitia?.type === "miniwasm") return null
      const data = await client.resource<InitiaTokenInfo>(metadata, "0x1::fungible_asset::Metadata")
      const { name, symbol, decimals } = data
      const denom = await client.denom(metadata)
      return { denom, metadata, name, symbol, decimals }
    },
    staleTime: Infinity,
  })

  if (isLoading) return null
  if (isError) return fallback || null
  if (!data) return fallback || null
  return <>{children(data)}</>
}

export default WithTokenInfo
