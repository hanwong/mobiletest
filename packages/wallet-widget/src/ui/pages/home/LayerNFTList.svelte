<script lang="ts">
import type { Chain } from "@initia/initia-registry-types"
import Empty from "../../components/Empty.svelte"
import Stack from "../../components/Stack.svelte"
import LayerNFTListItem from "./LayerNFTListItem.svelte"
import type { CollectionInfoResponse } from "../../../shared/queries"

export let layer: Chain
export let count: number
export let list: CollectionInfoResponse[]
export let isFetching: boolean
export let hasNextPage: boolean
export let fetchNextPage: () => void

$: loadMore = () => hasNextPage && !isFetching && fetchNextPage()
</script>

{#if !count}
  <Empty>No NFT</Empty>
{/if}

<Stack py={4}>
  {#each list as collectionInfo (collectionInfo.object_addr)}
    <LayerNFTListItem {layer} {collectionInfo} />
  {/each}

  {#if list.length > 0 && hasNextPage}
    <button on:click={loadMore}>
      {isFetching ? "Loading..." : "Load more"}
    </button>
  {/if}
</Stack>

<style>
button {
  color: var(--gray-5);
  font-size: 12px;
  font-weight: 600;
  margin-top: 20px;
  padding: 8px;
  text-align: center;
}
</style>
