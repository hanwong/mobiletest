<script lang="ts">
import BigNumber from "bignumber.js"
import { createQuery } from "@tanstack/svelte-query"
import { OmnitiaQueries } from "../../../../shared/queries"
import Price from "./Price.svelte"

const omnitia = OmnitiaQueries.getInstance()

export let offerDenom: string
export let offerSymbol: string
export let askDenom: string
export let askSymbol: string

$: offerPriceQuery = createQuery(omnitia.getSpotPriceBasedINIT(offerDenom))
$: askPriceQuery = createQuery(omnitia.getSpotPriceBasedINIT(askDenom))

$: offerPrice = $offerPriceQuery.data
$: askPrice = $askPriceQuery.data

$: price = askPrice && offerPrice ? BigNumber(askPrice).div(offerPrice).toNumber() : undefined
</script>

{#if price}
  <Price {price} {offerSymbol} {askSymbol} />
{/if}
