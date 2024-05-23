import { useMemo } from "react"
import { prop } from "ramda"
import { Text } from "@mantine/core"
import { getSwappableDenoms } from "@initia/utils"
import { useSwaplist } from "../../data/swap"
import { usePairsQuery } from "../../data/layers"
import { useDefinedLayer, useDefinedLayer1 } from "../../background"
import Page from "../../components/Page"
import { useDefinedSearchParam } from "./helpers/param"
import SwapForm from "./SwapForm"

const Swap = () => {
  const denom = useDefinedSearchParam("denom")
  const chainId = useDefinedSearchParam("layer")

  const layer = useDefinedLayer(chainId)
  const layer1 = useDefinedLayer1()

  const { data: pairs } = usePairsQuery(layer)

  const swappableL1 = useSwappableTokens()
  const swappable = useMemo(() => getSwappableDenoms({ layer, layer1, swappableL1 }), [layer, layer1, swappableL1])

  if (swappable.length > 0) {
    return <SwapForm layer={layer} pairs={pairs} initialOfferDenom={denom} swappable={swappable} />
  }

  return (
    <Page>
      <Text c="danger">Unsupported layer</Text>
    </Page>
  )
}

export default Swap

/* hooks */
function useSwappableTokens() {
  const swaplist = useSwaplist()
  const values = [...swaplist.values()]
  const denoms = ["uinit", ...values.flat().map(prop("denom"))]
  return [...new Set(denoms)]
}
