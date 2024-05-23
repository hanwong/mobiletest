<script lang="ts">
import { groupBy } from "ramda"
import type { Wallet } from "../../shared/wallets"
import wallets, { WalletNames } from "../../shared/wallets"
import { connect } from "../../stores/actions"
import { ethereumWalletsOnly } from "../../stores/config"
import ConnectingWallet from "./ConnectingWallet.svelte"
import WalletListColumn from "./WalletListColumn.svelte"

let connectingWallet: Wallet | undefined
let error: Error | undefined

async function handleConnect(wallet: Wallet) {
  connectingWallet = wallet

  try {
    await connect(wallet)
  } catch (e) {
    error = e as Error
  }
}

function reset() {
  connectingWallet = undefined
  error = undefined
}

const byWalletCategory = groupBy(function ({ name }: Wallet) {
  return name === WalletNames.Initia || name === WalletNames.InitiaMobile
    ? "Native Wallet"
    : name === WalletNames.Web3Auth
      ? "Social Login"
      : name === WalletNames.Ledger
        ? "Hardware Wallets"
        : "External Wallets"
})
</script>

<div class="root">
  {#if connectingWallet}
    <ConnectingWallet wallet={connectingWallet} {error} on:click={reset} />
  {:else}
    {@const entries = Object.entries(
      byWalletCategory(
        wallets.filter((wallet) => (ethereumWalletsOnly ? wallet.isEthereumWallet || wallet.isSolanaWallet : true)),
      ),
    )}

    <div class="mobile">
      <WalletListColumn {entries} on:connectWallet={(e) => handleConnect(e.detail)} />
    </div>

    <div class="desktop">
      <div class="column">
        <WalletListColumn entries={entries.slice(0, 2)} on:connectWallet={(e) => handleConnect(e.detail)} />
      </div>

      <div class="column">
        <WalletListColumn entries={entries.slice(2)} on:connectWallet={(e) => handleConnect(e.detail)} />
      </div>
    </div>
  {/if}
</div>

<style>
.desktop {
  display: none;
}

.column:last-of-type {
  border-left: 1px solid var(--modal-border-color);
}

@media screen and (min-width: 576px) {
  .mobile {
    display: none;
  }

  .desktop {
    display: flex;
  }
}
</style>
