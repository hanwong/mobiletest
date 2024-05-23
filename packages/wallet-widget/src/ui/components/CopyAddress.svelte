<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { truncate } from "@initia/utils"
import { LayerQueries, OmnitiaQueries } from "../../shared/queries"
import { address$ } from "../../stores/state"
import IconCopy from "../styles/icons/IconCopy.svelte"

const { layer1 } = OmnitiaQueries.getInstance()
$: usernameQuery = createQuery(LayerQueries.getInstance(layer1).username(address))
$: username = $usernameQuery.data

let hover = false

let copied = false
let copyTimeout: number | null = null

$: address = $address$

async function copy() {
  await navigator.clipboard.writeText(address)
  window.clearTimeout(copyTimeout!)
  copyTimeout = window.setTimeout(() => (copied = false), 1000)
  copied = true
}
</script>

<button on:click={copy} on:mouseenter={() => (hover = true)} on:mouseleave={() => (hover = false)}>
  {hover || copied ? truncate(address) : username || truncate(address)}
  <section class="icon"><IconCopy size={12} /></section>
  {copied ? "Copied" : ""}
</button>

<style>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.icon {
  display: flex;
  align-items: center;

  color: var(--gray-5);
}

button:hover .icon {
  color: var(--gray-2);
}
</style>
