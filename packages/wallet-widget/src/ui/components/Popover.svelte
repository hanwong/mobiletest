<script lang="ts">
import { onMount, onDestroy } from "svelte"
import { close } from "../../stores/actions"
import Indicator from "./Indicator.svelte"

export let style = ""

onMount(() => {
  document.addEventListener("click", close)
})

onDestroy(() => {
  document.removeEventListener("click", close)
})
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main on:click|stopPropagation {style}>
  <Indicator />
  <slot />
</main>
