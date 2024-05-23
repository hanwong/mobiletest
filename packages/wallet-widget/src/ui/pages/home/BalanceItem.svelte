<script lang="ts">
import { getContext } from "svelte"
import type { Writable } from "svelte/store"
import { slide } from "svelte/transition"
import { createQuery } from "@tanstack/svelte-query"
import type { Coin } from "@cosmjs/amino"
import type { Asset, Chain } from "@initia/initia-registry-types"
import { formatAmount, truncate } from "@initia/utils"
import BigNumber from "bignumber.js"
import { navigate } from "../../../lib/router"
import { LayerQueries, OmnitiaQueries } from "../../../shared/queries"
import { getDecimals, getLogo } from "../../../layers/InitiaLayer"
import Image from "../../components/Image.svelte"
import Group from "../../components/Group.svelte"

export let balance: Coin
export let assetL1: Asset | undefined
export let layer: Chain

const { layer1 } = OmnitiaQueries.getInstance()

$: selectedDenom = getContext<Writable<string>>("selectedDenom")

const { denom, amount } = balance
const logo = getLogo(assetL1)
const decimals = getDecimals(assetL1)
$: isSelected = $selectedDenom === denom

const priceQuery = createQuery({
  ...LayerQueries.getInstance(layer1).price(assetL1?.base ?? ""),
  enabled: !!(layer1 && assetL1),
})

$: price = $priceQuery.data
</script>

<button
  class="root"
  class:active={isSelected}
  on:click={() => (isSelected ? selectedDenom.set("") : selectedDenom.set(denom))}
>
  <div class="balance">
    <div class="unit">
      <Image src={logo} alt={assetL1?.name} height={26} />
      <div style:text-align="left">
        <div class="symbol">{assetL1?.symbol ?? truncate(denom)}</div>
        <div class="name">{assetL1?.name ?? ""}</div>
      </div>
    </div>

    <div style:text-align="right">
      <div class="amount">{formatAmount(amount, { decimals })}</div>
      {#if price}
        <div class="price">${formatAmount(BigNumber(amount).times(price), { fixed: 2 })}</div>
      {/if}
    </div>
  </div>

  {#if $selectedDenom === denom}
    <div transition:slide={{ duration: 150 }} class="actions">
      <Group gap={8}>
        <button class="action" on:click={() => navigate("/send", { denom, layer })}>Send</button>
        <button class="action" on:click={() => navigate("/swap", { denom, layer })}>Swap</button>
      </Group>
    </div>
  {/if}
</button>

<style>
.root {
  display: flex;
  flex-direction: column;

  background: var(--gray-8);
  border: 1px solid transparent;
  padding: 20px;
}

.root:last-of-type {
  border-bottom-left-radius: calc(var(--border-radius) + 1px);
  border-bottom-right-radius: calc(var(--border-radius) + 1px);
}

.root:hover {
  background: var(--gray-7);
}

.active {
  border-color: var(--gray-3);
}

.name {
  color: var(--gray-4);
  font-size: 10px;
  font-weight: 700;
}

.balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price {
  color: var(--gray-4);
  font-size: 11px;
  font-weight: 700;
}

.actions {
  margin-top: 15px;
}

.action {
  flex: 1;

  background: var(--gray-6);
  border-radius: 12px;
  height: 24px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.action:hover {
  background: var(--gray-5);
}
</style>
