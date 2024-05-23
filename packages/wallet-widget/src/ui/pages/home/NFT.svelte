<script lang="ts">
import type { Chain } from "@initia/initia-registry-types"
import { STORAGE_KEYS } from "../../../shared/constants"
import { getLayers } from "../../utils"
import Accordion from "../../components/Accordion.svelte"
import AccordionItem from "../../components/AccordionItem.svelte"
import LayerNFT from "./LayerNFT.svelte"
import ManageLayersButton from "./ManageLayersButton.svelte"

const layers = getLayers()

let opened: string[] = JSON.parse(
  localStorage.getItem(STORAGE_KEYS.OPENED_LAYERS_NFT) ?? JSON.stringify([layers[0].chain_id]),
)

function toggleLayer(layer: Chain) {
  if (opened.includes(layer.chain_id)) {
    opened = opened.filter((chainId) => chainId !== layer.chain_id)
  } else {
    opened = [...opened, layer.chain_id]
  }

  localStorage.setItem(STORAGE_KEYS.OPENED_LAYERS_NFT, JSON.stringify(opened))
}
</script>

<Accordion>
  {#each layers as layer}
    <AccordionItem
      icon={layer.logo_URIs?.png}
      title={layer.pretty_name ?? layer.chain_name}
      isOpen={opened.includes(layer.chain_id)}
      on:click={() => toggleLayer(layer)}
    >
      <LayerNFT {layer} />
    </AccordionItem>
  {/each}

  <ManageLayersButton />
</Accordion>
