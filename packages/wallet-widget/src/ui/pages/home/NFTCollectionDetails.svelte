<script lang="ts">
import { required } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { getState } from "../../../lib/router"
import type { CollectionInfoResponse } from "../../../shared/queries"
import Page from "../../components/Page.svelte"
import NFTCollectionDetailsList from "./NFTCollectionDetailsList.svelte"

const { collectionInfo, layer } = required(getState<{ collectionInfo: CollectionInfoResponse; layer: Chain }>())
</script>

<Page title={collectionInfo.collection.name}>
  <div class="scroll">
    <NFTCollectionDetailsList {collectionInfo} {layer} />
  </div>
</Page>
