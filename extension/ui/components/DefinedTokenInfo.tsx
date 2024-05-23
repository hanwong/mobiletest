import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { denomToMetadata } from "@initia/utils"
import type { Asset, Chain } from "@initia/initia-registry-types"
import { defaultChain } from "../../scripts/shared/chains"
import type { InitiaTokenInfo } from "../data/tokens"
import { useTokens } from "../data/tokens"
import { getTokenFromAsset } from "../data/layers"
import WithTokenInfo from "./WithTokenInfo"

interface Props {
  layer: Chain
  denom: string
  pairs?: Record<string, string>
  assets?: Asset[]
  children: (tokenInfo: InitiaTokenInfo, price?: number) => ReactNode
}

const DefinedTokenInfo = (props: Props) => {
  const { denom, pairs, assets, children } = props
  const tokens = useTokens()
  const denomL1 = pairs ? pairs[denom] : denom
  const token = tokens.get(denomL1)
  const price = usePrice(denomL1)
  if (token) return <>{children({ ...token, denom, price })}</>

  const asset = assets?.find((asset) => asset.base === denom)
  if (asset) return <>{children({ ...getTokenFromAsset(asset), price }, price)}</>

  return (
    <WithTokenInfo
      {...props}
      metadata={denomToMetadata(denom)}
      fallback={children({ denom, symbol: denom, decimals: 0, metadata: "" })}
    >
      {(token) => children({ ...token, denom, price })}
    </WithTokenInfo>
  )
}

export default DefinedTokenInfo

/* hooks */
function usePrice(denom: string) {
  const { data: price } = useQuery({
    queryKey: [defaultChain.api, denom, "price"],
    queryFn: async () => {
      const { data } = await axios.get<{ prices: { [denom: string]: number } }>(
        `/indexer/price/v1/prices/${encodeURIComponent(denom)}`,
        { baseURL: defaultChain.api },
      )

      return data.prices[denom] ?? null
    },
    enabled: !!denom,
  })

  return price
}
