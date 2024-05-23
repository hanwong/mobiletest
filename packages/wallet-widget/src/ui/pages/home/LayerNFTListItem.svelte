<script lang="ts">
import { createInfiniteQuery } from "@tanstack/svelte-query"
import type { Chain } from "@initia/initia-registry-types"
import { navigate } from "../../../lib/router"
import { address$ } from "../../../stores/state"
import type { CollectionInfoResponse } from "../../../shared/queries"
import { LayerQueries, parsePaginatedResponse } from "../../../shared/queries"
import IconChevronRight from "../../styles/icons/IconChevronRight.svelte"
import Group from "../../components/Group.svelte"
import NFTThumbnail from "./NFTThumbnail.svelte"

export let layer: Chain
export let collectionInfo: CollectionInfoResponse

$: address = $address$

$: query = createInfiniteQuery(LayerQueries.getInstance(layer).collectionTokens(collectionInfo.object_addr, address))

$: ({ data } = $query)
$: ({ list, count } = parsePaginatedResponse(data, "tokens"))
$: [primaryToken] = list

let hover = false
</script>

{#if data}
  <button
    on:mouseenter={() => (hover = true)}
    on:mouseleave={() => (hover = false)}
    on:click={() => navigate("/collection", { collectionInfo, layer })}
  >
    <div class="inner">
      <Group gap={12}>
        {#if primaryToken}
          <NFTThumbnail uri={primaryToken.nft.uri} size={58} />
        {/if}

        <div class="content">
          <div class="name">
            {collectionInfo.collection.name}
          </div>

          <div class="count">
            {count}
          </div>
        </div>
      </Group>

      {#if hover}
        <div class="chevron">
          <IconChevronRight />
        </div>
      {/if}
    </div>
  </button>
{/if}

<style>
button {
  padding: 8px 20px;
}

button:hover {
  background-color: var(--gray-6);
}

.inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.name {
  font-size: 14px;
  font-weight: 600;
}

.count {
  color: var(--gray-5);
  font-size: 12px;
  font-weight: 700;
}

.chevron {
  color: var(--gray-3);
}
</style>
