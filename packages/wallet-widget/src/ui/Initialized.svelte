<script lang="ts">
import LayerManager from "../layers/LayerManager"
import { OmnitiaQueries } from "../shared/queries"
import { layer } from "../stores/config"
import Frame from "./components/Frame.svelte"
import Loader from "./components/Loader.svelte"

async function initialize() {
  return await Promise.all([OmnitiaQueries.initialize(), LayerManager.initialize(layer)])
}
</script>

{#await initialize()}
  <Frame>
    <div class="scroll">
      <div class="inner">
        <Loader />
        <p>Initializing layers...</p>
      </div>
    </div>
  </Frame>
{:then}
  <slot />
{:catch error}
  <Frame>
    <div class="scroll">
      <div class="inner">
        <p>{error.message}</p>
      </div>
    </div>
  </Frame>
{/await}

<style>
.scroll {
  display: grid;
  place-items: center;
}

.inner {
  display: grid;
  place-items: center;
  gap: 16px;
}
</style>
