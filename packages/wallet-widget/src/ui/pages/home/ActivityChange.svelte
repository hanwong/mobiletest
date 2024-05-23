<script lang="ts">
import BigNumber from "bignumber.js"
import { createQuery } from "@tanstack/svelte-query"
import { formatAmount } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { LayerQueries, toAsset } from "../../../shared/queries"
import InitiaLayer, { getDecimals } from "../../../layers/InitiaLayer"

export let amount: string
export let denom: string = ""
export let layer: Chain

$: assetFound = InitiaLayer.getInstance(layer.chain_id).findAsset(denom)
$: query = createQuery({ ...LayerQueries.getInstance(layer).tokenInfo(denom), enabled: !assetFound })
$: ({ data: assetFetched } = $query)
$: asset = assetFound || assetFetched || toAsset({ denom })
</script>

{#if asset}
  {@const symbol = asset.symbol}
  {@const decimals = getDecimals(asset)}

  <div class="change" class:success={BigNumber(amount).isPositive()} class:danger={!BigNumber(amount).isPositive()}>
    {BigNumber(amount).isPositive() ? "+" : "-"}{formatAmount(BigNumber(amount).abs().toString(), { decimals })}
    {symbol}
  </div>
{/if}

<style>
.change {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
