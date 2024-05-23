<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { required } from "@initia/utils"
import { getState } from "../../../lib/router"
import type { CollectionInfoResponse, NFTTokenResponse } from "../../../shared/queries"
import { LayerQueries } from "../../../shared/queries"
import IconListDetails from "../../styles/icons/IconListDetails.svelte"
import Page from "../../components/Page.svelte"
import Stack from "../../components/Stack.svelte"
import NftThumbnail from "./NFTThumbnail.svelte"
import NftName from "./NFTName.svelte"

const { collectionInfo, token } =
  required(getState<{ collectionInfo: CollectionInfoResponse; token: NFTTokenResponse }>())
const query = createQuery(LayerQueries.nftMetadata(token.nft.uri))
$: ({ data: metadata } = $query)
$: attributes = metadata?.attributes
</script>

<Page title={collectionInfo.collection.name}>
  <div class="scroll">
    <Stack gap={12}>
      <NftThumbnail uri={token.nft.uri} />
      <div class="name">
        <NftName uri={token.nft.uri} tokenId={token.nft.token_id} />
      </div>
    </Stack>

    {#if attributes}
      <div class="attrs">
        <div class="title">
          <IconListDetails />
          <div>
            Traits ({attributes.length})
          </div>
        </div>

        <div class="list">
          <Stack gap={12}>
            {#each attributes as { trait_type, value } (trait_type)}
              <div class="item">
                <div class="type">
                  {trait_type}
                </div>
                <div class="value">
                  {value}
                </div>
              </div>
            {/each}
          </Stack>
        </div>
      </div>
    {/if}
  </div>
</Page>

<style>
.name {
  font-size: 24px;
}

.scroll :global(img) {
  width: 100%;
  height: auto;
}

.attrs {
  margin-top: 40px;
}

.attrs .title {
  display: flex;
  align-items: center;
  gap: 4px;

  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.attrs .list {
  margin-top: 20px;
}

.item {
  background: var(--gray-7);
  border-radius: 12px;
  padding: 12px;
}

.type {
  color: var(--gray-4);
  font-size: 12px;
  font-weight: 600;
}

.value {
  font-size: 16px;
  font-weight: 700;
}
</style>
