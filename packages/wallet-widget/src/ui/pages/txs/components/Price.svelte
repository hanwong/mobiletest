<script lang="ts">
import BigNumber from "bignumber.js"
import { formatNumber } from "@initia/utils"

export let price: string | number
export let offerSymbol: string
export let askSymbol: string

let showOfferToAsk = BigNumber(price).gt(1)

$: toggle = () => {
  showOfferToAsk = !showOfferToAsk
}

$: offerToAsk = `1 ${offerSymbol} = ${formatNumber(price)} ${askSymbol}`
$: askToOffer = `1 ${askSymbol} = ${formatNumber(BigNumber(1).div(price).toString())} ${offerSymbol}`
</script>

<button type="button" on:click={toggle}>
  {#if showOfferToAsk}
    {offerToAsk}
  {:else}
    {askToOffer}
  {/if}
</button>
