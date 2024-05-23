<script lang="ts">
import widget from "../widget"
const { onboard, view, address$ } = widget

$: address = $address$
</script>

{#if !address}
  <button on:click={onboard}>Connect to a Wallet</button>
{:else}
  <button on:click={view}>{address}</button>
{/if}
