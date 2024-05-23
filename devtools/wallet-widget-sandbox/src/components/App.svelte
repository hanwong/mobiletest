<script lang="ts">
import widget from "../widget"
import Connection from "./Connection.svelte"
import Tx from "./Tx.svelte"
import Arbitrary from "./Arbitrary.svelte"
import LoremIpsum from "./LoremIpsum.svelte"

const { onboard, view, address$ } = widget

$: address = $address$

$: {
  if (address) view()
  else onboard()
}
</script>

<header>
  {#if address}
    <Tx />
  {/if}

  <Connection />
</header>

{#if address}
  <Arbitrary />
{/if}

<LoremIpsum />

<style>
header {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  position: sticky;
  top: 0;
}
</style>
