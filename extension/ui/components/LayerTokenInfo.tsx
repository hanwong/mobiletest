import type { ReactNode } from "react"
import type { Chain } from "@initia/initia-registry-types"
import type { InitiaTokenInfo } from "../data/tokens"
import { useAssetsQuery, usePairsQuery } from "../data/layers"
import DefinedTokenInfo from "./DefinedTokenInfo"

interface Props {
  layer: Chain
  denom: string
  children: (tokenInfo: InitiaTokenInfo) => ReactNode
}

const LayerTokenInfo = ({ layer, denom, children }: Props) => {
  const { data: pairs } = usePairsQuery(layer)
  const { data: assets } = useAssetsQuery(layer)

  return (
    <DefinedTokenInfo
      layer={layer}
      denom={denom}
      pairs={layer.metadata?.is_l1 ? undefined : pairs}
      assets={assets}
      key={denom}
    >
      {children}
    </DefinedTokenInfo>
  )
}

export default LayerTokenInfo
