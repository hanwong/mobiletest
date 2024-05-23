<script lang="ts">
import { isLoading$ } from "../stores/state"
import Loader from "./components/Loader.svelte"

$: isLoading = $isLoading$
</script>

{#if isLoading}
  <div class="root">
    <div class="inner">
      <Loader />
      <p>Reconnecting...</p>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
.root {
  display: grid;
  place-items: center;

  min-width: 280px;
  min-height: 280px;
}

.inner {
  display: grid;
  place-items: center;
  gap: 16px;
}
</style>
