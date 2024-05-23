<script lang="ts">
import { BigNumber } from "bignumber.js"
import { createQuery } from "@tanstack/svelte-query"
import {
  DEFAULT_SLIPPAGE_PERCENT,
  Tx,
  calcMinimum,
  formatAmount,
  getRest,
  required,
  toAmount,
  truncate,
} from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { getState, navigate } from "../../../lib/router/routing"
import { LayerQueries } from "../../../shared/queries"
import InitiaLayer, { getDecimals, getLogo } from "../../../layers/InitiaLayer"
import { modules } from "../../../stores/config"
import { address$ } from "../../../stores/state"
import { findLayer, getLayers } from "../../utils"
import Page from "../../components/Page.svelte"
import Stack from "../../components/Stack.svelte"
import Image from "../../components/Image.svelte"
import RecipientInput from "./components/RecipientInput.svelte"
import SlippageInput from "./components/SlippageInput.svelte"
import SelectWrapper from "../../components/SelectWrapper.svelte"

export let layer1: Chain
const address = $address$
const { denom, layer } = required(getState<{ denom: string; layer: Chain }>())
const { pairs, findAsset } = InitiaLayer.getInstance(layer.chain_id)

const layers = getLayers()
const asset = findAsset(denom)
const symbol = asset?.symbol
const logo = getLogo(asset)
const decimals = getDecimals(asset)

$: balanceQuery = createQuery(LayerQueries.getInstance(layer).balance(address, denom))
$: balance = $balanceQuery.data

/* form values */
let targetLayerChainId = layer.chain_id
let recipientAddress = ""
let value = ""
let memo = ""
let slippagePercent = DEFAULT_SLIPPAGE_PERCENT

/* tx */
$: amount = toAmount(value, decimals)
$: targetLayer = required(findLayer(targetLayerChainId))

const tx = new Tx({ address, layer, layer1, modules, pairs })
$: send = tx.send({ denom, targetLayer })

/* simulation */
$: simulationQuery = createQuery({
  queryKey: [getRest(layer1), "Swap:Simulation", { targetLayerChainId, amount }],
  queryFn: async () => send.simulate({ amount }),
})

$: simulated = $simulationQuery.data
$: minimum = simulated ? calcMinimum(simulated[0], String(slippagePercent)) : undefined

/* submit */
$: handleSubmit = () => {
  try {
    const messages = send.getMessages({ amount, recipientAddress, minimum })
    navigate("/confirm", { layer, txBodyValue: { messages, memo } })
  } catch (error) {
    window.alert(error)
  }
}

/* render */
$: disabled = !recipientAddress || !value || !balance || BigNumber(toAmount(value)).gt(balance)
</script>

<Page title="Send">
  <form on:submit|preventDefault={handleSubmit} id="form" class="scroll">
    <Stack gap={20}>
      <div>
        <label for="chain-id">Destination Network</label>

        <SelectWrapper iconRight={20}>
          <select class="input" bind:value={targetLayerChainId}>
            {#each layers as { chain_id, chain_name, pretty_name }}
              <option value={chain_id}>{pretty_name ?? chain_name}</option>
            {/each}
          </select>
        </SelectWrapper>
      </div>

      <RecipientInput bind:recipientAddress {layer1} />

      <div>
        <label for="value">Amount</label>

        <div class="wrapper">
          <div class="unit">
            <Image src={logo} alt={asset?.name + " logo"} width={20} height={20} />
            {asset?.symbol ?? truncate(denom)}
          </div>

          <button type="button" on:click={() => (value = formatAmount(balance, { decimals }))}>
            Available
            <span class="underline">{formatAmount(balance, { decimals })}</span>
          </button>
          <input type="text" id="value" placeholder="0" bind:value />
        </div>
      </div>

      <div>
        <label for="memo">Memo</label>
        <input type="text" id="memo" bind:value={memo} />
      </div>

      {#if minimum}
        <div class="item">
          <span class="title">Minimum received</span>
          <div class="content">{formatAmount(minimum, { decimals })} {symbol}</div>
        </div>
      {/if}
    </Stack>
  </form>

  <footer class="footer">
    {#if send.getSimulationParams({ amount })}
      <SlippageInput bind:value={slippagePercent} />
    {/if}
    <button type="submit" form="form" class="submit" {disabled}>Submit</button>
  </footer>
</Page>

<style>
input#value {
  font-size: 24px;
  height: 100px;
  text-align: right;
  padding-top: 30px;
}

.wrapper {
  position: relative;
}

.wrapper .unit {
  position: absolute;
  top: 20px;
  left: 20px;

  display: flex;
  align-items: center;
  gap: 4px;

  color: var(--gray-0);
  font-size: 16px;
  font-weight: 700;
}

.wrapper button {
  position: absolute;
  top: 24px;
  right: 20px;

  display: flex;
  gap: 6px;

  font-size: 12px;
  font-weight: 700;
  color: var(--gray-5);
}

.wrapper button .underline {
  color: var(--gray-1);
}

.item {
  display: flex;
  justify-content: space-between;

  color: var(--gray-1);
  font-size: 12px;
  font-weight: 600;
}

.item .title {
  color: var(--gray-3);
}

.footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit {
  flex: none;
}
</style>
