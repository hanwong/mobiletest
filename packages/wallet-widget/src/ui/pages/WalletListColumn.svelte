<script lang="ts">
import type { Wallet } from "../../shared/wallets"
import Stack from "../components/Stack.svelte"
import WalletListItem from "./WalletListItem.svelte"

export let entries: [string, Wallet[]][]
</script>

<div class="root">
  <Stack gap={8} py={16} px={18}>
    {#each entries as [key, list]}
      <h2>{key}</h2>

      {#each list as wallet}
        <WalletListItem on:connectWallet {wallet} />
      {/each}
    {/each}
  </Stack>
</div>

<style>
.root {
  min-width: 280px;
}

h2 {
  color: var(--gray-3);
  font-size: 12px;
  font-weight: 600;
}

h2:not(:first-child) {
  margin-top: 12px;
}
</style>
