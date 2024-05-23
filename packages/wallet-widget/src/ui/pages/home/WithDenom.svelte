<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import type { Chain } from "@initia/initia-registry-types"
import { LayerQueries } from "../../../shared/queries"

export let metadata: string
export let layer: Chain

$: denomQuery = createQuery(LayerQueries.getInstance(layer).metdataToDenom(metadata))
$: ({ data } = $denomQuery)
</script>

{#if data}
  <slot denom={data} />
{/if}
