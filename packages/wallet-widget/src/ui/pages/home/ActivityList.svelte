<script lang="ts">
import type { TxItem } from "../../../shared/queries"
import Empty from "../../components/Empty.svelte"
import ActivityItem from "./ActivityItem.svelte"

export let list: TxItem[]
export let count: number
export let hasNextPage: boolean
export let isFetching: boolean
export let fetchNextPage: () => void

$: loadMore = () => hasNextPage && !isFetching && fetchNextPage()
</script>

{#if !count}
  <Empty>No activity yet</Empty>
{:else}
  <div class="txs">
    {#each list as item}
      <ActivityItem txItem={item} />
    {/each}
  </div>

  {#if list.length > 0 && hasNextPage}
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <button on:click={loadMore}>
        {isFetching ? "Loading..." : "Load more"}
      </button>
    </div>
  {/if}
{/if}

<style>
.txs {
  margin: 0 -20px;
  overflow: hidden;
}
</style>
