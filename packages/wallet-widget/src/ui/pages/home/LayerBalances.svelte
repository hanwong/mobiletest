<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { descend, sortWith } from "ramda"
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin"
import type { Chain } from "@initia/initia-registry-types"
import { LayerQueries } from "../../../shared/queries"
import InitiaLayer from "../../../layers/InitiaLayer"
import { address$ } from "../../../stores/state"
import BalanceItem from "./BalanceItem.svelte"

export let layer: Chain

$: address = $address$

$: balancesQuery = createQuery(LayerQueries.getInstance(layer).balances(address))
$: ({ data: balances, error } = $balancesQuery)
$: initiaLayer = InitiaLayer.getInstance(layer.chain_id)

$: sort = sortWith<Coin>([descend(({ denom }) => initiaLayer.findAsset(denom)?.base === "uinit")])
</script>

{#if error}
  <p class="danger">{error.message}</p>
{:else if balances && initiaLayer}
  {#if balances.length === 0}
    <p class="empty">No Assets</p>
  {/if}

  <section class="balances">
    {#each sort(balances) as balance (balance.denom)}
      {@const asset = initiaLayer.findAsset(balance.denom)}
      <BalanceItem {balance} assetL1={asset} {layer} />
    {/each}
  </section>
{/if}

<style>
.balances {
  display: flex;
  flex-direction: column;
  gap: 1px;

  background: var(--gray-7);
  font-size: 14px;
  font-weight: 700;
}

.empty {
  color: var(--gray-4);
  font-size: 14px;
  font-weight: 600;
  margin: 18px 0;
  text-align: center;
}
</style>
