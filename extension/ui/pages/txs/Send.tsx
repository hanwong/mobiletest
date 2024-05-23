import { getRPC } from "@initia/utils"
import { useBalance } from "../../data/interchain"
import { useAddress, useDefinedLayer } from "../../background"
import LayerTokenInfo from "../../components/LayerTokenInfo"
import { usePairsQuery } from "../../data/layers"
import HomeHeader from "../home/components/HomeHeader"
import { useDefinedSearchParam } from "./helpers/param"
import SendForm from "./SendForm"

const SendInitia = () => {
  const chainId = useDefinedSearchParam("layer")
  const denom = useDefinedSearchParam("denom")

  const address = useAddress()
  const layer = useDefinedLayer(chainId)

  const { data: pairs } = usePairsQuery(layer)
  const { data: balance } = useBalance(getRPC(layer), address, denom)

  if (!balance) return null

  return (
    <LayerTokenInfo layer={layer} denom={denom}>
      {(token) => <SendForm {...token} balance={balance} denom={denom} chainId={chainId} pairs={pairs} />}
    </LayerTokenInfo>
  )
}

const Send = () => {
  return (
    <>
      <HomeHeader />
      <SendInitia />
    </>
  )
}

export default Send
