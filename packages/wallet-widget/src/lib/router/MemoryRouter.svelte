<script lang="ts">
import { onDestroy, type SvelteComponent } from "svelte"
import { router } from "./store"
import { navigate } from "./routing"

export let routes: Record<string, typeof SvelteComponent>

let CurrentComponent: typeof SvelteComponent | null = null

const unsubscribe = router.subscribe(({ current }) => {
  CurrentComponent = routes[current.path] || routes["/*"]
})

onDestroy(() => {
  navigate("/")
  unsubscribe()
})
</script>

{#if CurrentComponent}
  <svelte:component this={CurrentComponent} />
{/if}
