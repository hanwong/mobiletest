<script lang="ts">
import { createInfiniteQuery } from "@tanstack/svelte-query"
import type { Chain } from "@initia/initia-registry-types"
import { navigate } from "../../../lib/router"
import { address$ } from "../../../stores/state"
import type { CollectionInfoResponse } from "../../../shared/queries"
import { LayerQueries, parsePaginatedResponse } from "../../../shared/queries"
import Stack from "../../components/Stack.svelte"
import NftThumbnail from "./NFTThumbnail.svelte"
import NftName from "./NFTName.svelte"

export let collectionInfo: CollectionInfoResponse
export let layer: Chain

const address = $address$

const query = createInfiniteQuery(LayerQueries.getInstance(layer).collectionTokens(collectionInfo.object_addr, address))

$: ({ data, hasNextPage, isFetching, fetchNextPage } = $query)
$: ({ list } = parsePaginatedResponse(data, "tokens"))

$: loadMore = () => hasNextPage && !isFetching && fetchNextPage()
</script>

<div class="grid">
  {#each list as token (token.object_addr)}
    <button class="item" on:click={() => navigate("/nft", { collectionInfo, token, layer })}>
      <Stack gap={4}>
        <NftThumbnail uri={token.nft.uri} />
        <p class="name">
          <NftName uri={token.nft.uri} tokenId={token.nft.token_id} />
        </p>
      </Stack>
    </button>
  {/each}
</div>

{#if list.length > 0 && hasNextPage}
  <button on:click={loadMore}>
    {isFetching ? "Loading..." : "Load more"}
  </button>
{/if}

<style>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px 4px;
}

.item {
  overflow: hidden;
}

.item :global(img) {
  width: 100%;
  height: auto;
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 12px;
  font-weight: 600;
}
</style>
