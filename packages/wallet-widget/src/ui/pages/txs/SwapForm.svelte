<script lang="ts">
import { BigNumber } from "bignumber.js"
import { createQuery } from "@tanstack/svelte-query"
import {
  type SwapPair,
  DEFAULT_SLIPPAGE_PERCENT,
  Tx,
  calcMinimum,
  formatAmount,
  formatPercent,
  getRest,
  required,
  toAmount,
  toQuantity,
} from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { getState, navigate } from "../../../lib/router/routing"
import { LayerQueries } from "../../../shared/queries"
import InitiaLayer, { getDecimals, getLogo } from "../../../layers/InitiaLayer"
import { modules } from "../../../stores/config"
import { address$ } from "../../../stores/state"
import IconArrowRight from "../../styles/icons/IconArrowRight.svelte"
import Page from "../../components/Page.svelte"
import Stack from "../../components/Stack.svelte"
import Image from "../../components/Image.svelte"
import TokenSymbol from "../../components/TokenSymbol.svelte"
import SelectWrapper from "../../components/SelectWrapper.svelte"
import RelativePrice from "./components/RelativePrice.svelte"
import Price from "./components/Price.svelte"
import SlippageInput from "./components/SlippageInput.svelte"

export let layer1: Chain
export let swappable: string[]
export let swaplistMap: Map<string, SwapPair>
const { denom: initialOfferDenom, layer } = required(getState<{ denom: string; layer: Chain }>())
const { pairs, findAsset } = InitiaLayer.getInstance(layer.chain_id)
const address = $address$

/* form values */
let offerDenom = initialOfferDenom
let askDenom = ""
let value = ""
let slippagePercent = DEFAULT_SLIPPAGE_PERCENT

$: offerAsset = findAsset(offerDenom)
$: offerSymbol = offerAsset?.symbol
$: offerLogo = getLogo(offerAsset)
$: offerDecimals = getDecimals(offerAsset)

$: askAsset = findAsset(askDenom)
$: askSymbol = askAsset?.symbol
$: askLogo = getLogo(askAsset)
$: askDecimals = getDecimals(askAsset)

$: balanceQuery = createQuery(LayerQueries.getInstance(layer).balance(address, offerDenom))
$: balance = $balanceQuery.data

/* tx */
$: amount = toAmount(value, offerDecimals)

const tx = new Tx({ address, layer, layer1, modules, pairs })
$: swap = tx.swap({ offerDenom, askDenom, swaplist: swaplistMap })

/* simulation */
$: simulationQuery = createQuery({
  queryKey: [getRest(layer1), "Swap:Simulation", { amount, offerDenom, askDenom }] as const,
  queryFn: () => swap.simulate({ amount }),
})

$: simulation = $simulationQuery

$: swapFeeRateQuery = createQuery({
  queryKey: [getRest(layer1), "config", { offerDenom, askDenom }] as const,
  queryFn: () => swap.fetchSwapFeeRate(),
})

$: swapFeeRate = $swapFeeRateQuery.data

/* submit */
$: handleSubmit = () => {
  try {
    if (simulation.isLoading) throw new Error("Simulating...")
    const { returnAmount: simulated } = required(simulation.data)
    const messages = swap.getMessages({ amount, simulated, slippagePercent: String(slippagePercent) })
    navigate("/confirm", { layer, txBodyValue: { messages } })
  } catch (error) {
    window.alert(error)
  }
}

/* render */
$: renderSimulatedText = () => {
  if (!simulation.data) return ""
  const { returnAmount } = simulation.data
  const returnQuantity = toQuantity(returnAmount, askDecimals)
  const fixed = BigNumber(returnQuantity).gt(1000) ? 2 : 6
  return formatAmount(returnAmount, { fixed })
}

$: renderPriceImpact = (priceImpact: string) => {
  const SMALLEST = 0.0001
  if (BigNumber(priceImpact).lt(SMALLEST)) return `<${formatPercent(SMALLEST)}`
  return formatPercent(priceImpact)
}

$: disabled = !value || !balance || BigNumber(toAmount(value)).gt(balance)
</script>

<Page title="Swap">
  <form on:submit|preventDefault={handleSubmit} id="form" class="scroll">
    <Stack gap={20}>
      <div class="swap">
        <div class="wrapper">
          <div class="unit">
            <Image src={offerLogo} alt={offerAsset?.name + " logo"} width={20} height={20} />
            <SelectWrapper>
              <select bind:value={offerDenom}>
                {#each swappable as denom}
                  <option value={denom}>
                    <TokenSymbol {layer} {denom} />
                  </option>
                {/each}
              </select>
            </SelectWrapper>
          </div>

          <button type="button" on:click={() => (value = formatAmount(balance, { decimals: offerDecimals }))}>
            Available
            <span class="underline">{formatAmount(balance, { decimals: offerDecimals })}</span>
          </button>

          <input type="text" id="value" placeholder="0" bind:value />
        </div>

        <button
          type="button"
          class="arrow"
          on:click={() => {
            if (!askDenom) return
            const temp = offerDenom
            offerDenom = askDenom
            askDenom = temp
          }}
        >
          <IconArrowRight size={12} />
        </button>

        <div class="wrapper">
          <div class="unit">
            {#if askDenom}
              <Image src={askLogo} alt={askAsset?.name + " logo"} width={20} height={20} />
            {/if}

            <SelectWrapper>
              <select bind:value={askDenom}>
                <option value="" disabled>Select token</option>
                {#each swappable as denom}
                  <option value={denom}>
                    <TokenSymbol {layer} {denom} />
                  </option>
                {/each}
              </select>
            </SelectWrapper>
          </div>

          <input
            type="text"
            id="simulated"
            placeholder={simulation.isFetching ? "Simulating..." : "0"}
            value={renderSimulatedText()}
            readonly
          />
        </div>
      </div>

      {#if offerSymbol && askSymbol && offerSymbol !== askSymbol}
        <Stack gap={8}>
          <div class="item">
            <span class="title">Pool price</span>
            <div class="content"><RelativePrice {offerDenom} {offerSymbol} {askDenom} {askSymbol} /></div>
          </div>

          {#if simulation.data}
            <div class="item">
              <span class="title">Expected price</span>
              <div class="content"><Price price={simulation.data.expectedPrice} {offerSymbol} {askSymbol} /></div>
            </div>

            {@const minimumReceived = calcMinimum(simulation.data.returnAmount, String(slippagePercent))}
            <div class="item">
              <span class="title">Minimum received</span>
              <div class="content">{formatAmount(minimumReceived, { decimals: askDecimals })} {askSymbol}</div>
            </div>

            <div class="item">
              <span class="title">Price impact</span>
              <div class="content">{renderPriceImpact(simulation.data.priceImpact)}</div>
            </div>
          {/if}

          {#if swapFeeRate}
            <div class="item">
              <span class="title">Swap fee</span>
              <div class="content">{formatPercent(swapFeeRate, false)}</div>
            </div>
          {/if}
        </Stack>
      {/if}
    </Stack>
  </form>

  <footer class="footer">
    <SlippageInput bind:value={slippagePercent} />
    <button type="submit" form="form" class="submit" {disabled}>Submit</button>
  </footer>
</Page>

<style>
.swap {
  background: var(--gray-6);
  border-radius: 20px;
  display: grid;
  gap: 1px;
  position: relative;
}

#value {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

#simulated {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

input {
  font-size: 24px;
  height: 100px;
  text-align: right;
  padding-top: 30px;
}

select {
  padding-right: 20px;
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

.arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  z-index: 1;

  background: var(--gray-6);
  width: 24px;
  height: 24px;
  border-radius: 50%;

  display: grid;
  place-items: center;
  box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2);
}

.arrow:hover {
  background: var(--gray-5);
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
