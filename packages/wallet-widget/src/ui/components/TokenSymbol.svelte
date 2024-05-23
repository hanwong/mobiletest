<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { truncate } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { LayerQueries, toAsset } from "../../shared/queries"
import InitiaLayer from "../../layers/InitiaLayer"

export let layer: Chain
export let denom: string

$: assetFound = InitiaLayer.getInstance(layer.chain_id).findAsset(denom)
$: query = createQuery({ ...LayerQueries.getInstance(layer).tokenInfo(denom), enabled: !assetFound })
$: ({ data: assetFetched } = $query)
$: asset = assetFound || assetFetched || toAsset({ denom })
</script>

{truncate(asset?.symbol)}
