<script lang="ts" context="module">
function getSwappableTokens(swaplistMap: Map<string, SwapPair>) {
  const values = [...swaplistMap.values()]
  const denoms = ["uinit", ...values.flat().map(prop("denom"))]
  return [...new Set(denoms)]
}
</script>

<script lang="ts">
import { prop } from "ramda"
import { getSwappableDenoms, required, type SwapPair } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { getState } from "../../../lib/router"
import { OmnitiaQueries } from "../../../shared/queries"
import SwapForm from "./SwapForm.svelte"

const { layer } = required(getState<{ denom: string; layer: Chain }>())
const omnitia = OmnitiaQueries.getInstance()
const { layer1 } = omnitia
</script>

{#await OmnitiaQueries.initializeSwaplist() then swaplistMap}
  {@const swappableL1 = getSwappableTokens(swaplistMap)}
  {@const swappable = layer1 ? getSwappableDenoms({ layer, layer1, swappableL1 }) : []}
  <SwapForm {layer1} {swappable} {swaplistMap} />
{/await}
