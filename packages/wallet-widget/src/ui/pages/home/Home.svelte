<script lang="ts">
import Header from "./Header.svelte"
import Assets from "./Assets.svelte"
import NFT from "./NFT.svelte"
import Activity from "./Activity.svelte"
import Disconnect from "./Disconnect.svelte"
import HomeTabs from "./HomeTabs.svelte"

let currentTab = "assets"

const tabs = [
  { id: "assets", label: "Assets", component: Assets },
  { id: "nft", label: "NFT", component: NFT },
  { id: "activity", label: "Activity", component: Activity },
]
</script>

<Header />

<section class="scroll">
  <HomeTabs {currentTab} {tabs} on:select={(e) => (currentTab = e.detail)} />

  <div style:padding-top="30px">
    {#each tabs as tab}
      {#if tab.id === currentTab}
        <svelte:component this={tab.component} />
      {/if}
    {/each}
  </div>
</section>

<Disconnect />

<style>
.scroll {
  padding: 20px;
}
</style>
