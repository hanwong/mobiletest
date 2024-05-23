<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { createHTTPClient } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { omnitiaURL } from "../../../stores/config"
import LayerManager from "../../../layers/LayerManager"
import Page from "../../components/Page.svelte"
import Stack from "../../components/Stack.svelte"
import ManageLayersItem from "./ManageLayersItem.svelte"

const allLayersQuery = createQuery({
  queryKey: ["allLayers"],
  queryFn: async () => {
    const omniClient = createHTTPClient(omnitiaURL)
    return omniClient.get<
      Pick<Chain, "chain_id" | "chain_name" | "pretty_name" | "description" | "logo_URIs" | "website">[]
    >("/v1/registry/chains/compact")
  },
})

$: ({ data: allLayers = [] } = $allLayersQuery)

const layersManagerInstance = LayerManager.getInstance()
const layers$ = layersManagerInstance.layers$
$: addedLayers = $layers$
$: notAddedLayers = allLayers.filter(
  (layer) => !addedLayers.some((addedLayer) => addedLayer.chain_id === layer.chain_id),
)
</script>

<Page title="Manage my Minitias">
  <section class="scroll">
    <Stack gap={8}>
      <h2>Shown</h2>

      {#each addedLayers as layer (layer.chain_id)}
        <ManageLayersItem {layer} isAdded />
      {/each}
    </Stack>

    <div class="divider" />

    {#if notAddedLayers.length > 0}
      <Stack gap={8}>
        <h2>Hidden</h2>
        {#each notAddedLayers as layer (layer.chain_id)}
          <ManageLayersItem {layer} />
        {/each}
      </Stack>
    {/if}
  </section>
</Page>

<style>
.divider {
  margin: 28px 0;
}

h2 {
  color: var(--gray-1);
  font-size: 12px;
  font-weight: 700;
}
</style>
