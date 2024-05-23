<script lang="ts">
import { createMutation } from "@tanstack/svelte-query"
import type { Chain } from "@initia/initia-registry-types"
import { layer as defaultLayer } from "../../../stores/config"
import LayerManager from "../../../layers/LayerManager"
import IconPlus from "../../styles/icons/IconPlus.svelte"
import IconTrash from "../../styles/icons/IconTrash.svelte"
import Image from "../../components/Image.svelte"

export let layer: Pick<Chain, "chain_id" | "chain_name" | "pretty_name" | "description" | "logo_URIs" | "website">
export let isAdded: boolean = false

const { chain_id, pretty_name, chain_name, description, logo_URIs, website } = layer

const layersManagerInstance = LayerManager.getInstance()

$: mutation = createMutation({
  mutationFn: (chain_id: string) => {
    if (isAdded) return layersManagerInstance.deleteLayer(chain_id)
    return layersManagerInstance.addLayerWithChainId(chain_id)
  },
})
</script>

<div class="root">
  <div class="wrapper">
    <Image src={logo_URIs?.png} width={32} height={32} />

    <div class="content">
      <span>{pretty_name ?? chain_name}</span>
      <p>{description}</p>
    </div>
  </div>

  <footer>
    <a href={website} target="_blank">Website</a>

    {#if layer.chain_id !== defaultLayer.chain_id}
      <button on:click={() => $mutation.mutate(chain_id)} disabled={$mutation.isPending}>
        {#if isAdded}
          <IconTrash size={12} />
          Delete
        {:else}
          <IconPlus size={12} />
          Add
        {/if}
      </button>
    {/if}
  </footer>
</div>

<style>
.root {
  background: var(--gray-7);
  border-radius: 20px;
  display: grid;
  gap: 12px;
  padding: 16px 20px;
}

.wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content span {
  color: var(--gray-0);
  font-size: 16px;
  font-weight: 600;
}

.content p {
  color: var(--gray-3);
  font-size: 12px;
  font-weight: 500;
}

footer {
  display: flex;
  gap: 8px;
}

footer a,
footer button {
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  background: var(--gray-6);
  border-radius: 12px;
  color: var(--gray-1);
  height: 24px;
  text-decoration: none;

  &:hover {
    background: var(--gray-5);
  }

  &:disabled {
    opacity: 0.5;
  }
}
</style>
