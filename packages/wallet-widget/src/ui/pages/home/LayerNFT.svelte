<script lang="ts">
import type { Chain } from "@initia/initia-registry-types"
import { createInfiniteQuery } from "@tanstack/svelte-query"
import { LayerQueries, parsePaginatedResponse } from "../../../shared/queries"
import { address$ } from "../../../stores/state"
import LayerNFTList from "./LayerNFTList.svelte"

export let layer: Chain

$: address = $address$

$: query = createInfiniteQuery(LayerQueries.getInstance(layer).collections(address))
$: ({ data, ...rest } = $query)
$: ({ list, count } = parsePaginatedResponse(data, "collections"))
</script>

{#if data}
  <LayerNFTList {layer} {list} {count} {...rest} />
{/if}
