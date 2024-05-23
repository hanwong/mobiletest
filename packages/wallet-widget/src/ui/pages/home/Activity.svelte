<script lang="ts">
import { setContext } from "svelte"
import { writable } from "svelte/store"
import { createInfiniteQuery } from "@tanstack/svelte-query"
import { findLayer, getLayers } from "../../utils"
import { address$ } from "../../../stores/state"
import { LayerQueries, parsePaginatedResponse } from "../../../shared/queries"
import SelectWrapper from "../../components/SelectWrapper.svelte"
import ActivityList from "./ActivityList.svelte"

const layers = getLayers()

let selectedChainId = writable(layers[0].chain_id)
setContext("selectedChainId", selectedChainId)
$: selectedLayer = findLayer($selectedChainId)!
$: address = $address$
$: query = createInfiniteQuery(LayerQueries.getInstance(selectedLayer).txs(address))
$: ({ data, ...rest } = $query)
$: parsed = parsePaginatedResponse(data, "txs")
</script>

<div class="selector">
  <SelectWrapper iconSize={12} iconRight={16}>
    <select bind:value={$selectedChainId}>
      {#each layers as { chain_id, chain_name, pretty_name }}
        <option value={chain_id}>{pretty_name ?? chain_name}</option>
      {/each}
    </select>
  </SelectWrapper>
</div>

{#if data}
  <ActivityList {...parsed} {...rest} />
{/if}

<style>
.selector {
  display: flex;
  justify-content: flex-end;
}

select {
  border-radius: 20px;
  border: 1px solid var(--gray-5);
  color: var(--gray-1);
  font-size: 12px;
  font-weight: 600;
  padding: 10px 16px;
  padding-right: calc(16px + 12px + 16px);
}
</style>
