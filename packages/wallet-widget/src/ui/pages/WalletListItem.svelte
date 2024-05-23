<script lang="ts">
import { createEventDispatcher } from "svelte"
import type { Wallet } from "../../shared/wallets"

const dispatch = createEventDispatcher()

export let wallet: Wallet
</script>

<button class="item" on:click={() => dispatch("connectWallet", wallet)}>
  <img src={wallet.logo} alt={wallet.name} width="28" height="28" />
  <span>{wallet.loginProvider?.label ?? wallet.name}</span>
</button>

<style>
.item {
  display: flex;
  align-items: center;
  gap: 12px;

  border-radius: 12px;
  font-weight: 600;
  margin: 0 -8px;
  padding: 10px 8px;
}

.item:hover {
  background-color: var(--gray-7);
}
</style>
