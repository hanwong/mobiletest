<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { createHTTPClient, getAPI, getGasPrice, type TxBodyValue } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import Loader from "../../components/Loader.svelte"
import ConfirmTxComponent from "./ConfirmTxComponent.svelte"

export let layer: Chain
export let txBodyValue: TxBodyValue
export let gas: number | undefined = undefined
export let skipPollingTx: boolean | undefined = false
export let onSuccess: (data: string) => void
export let onError: (error: Error) => void
export let reject: () => void

const isL1 = Boolean(layer.metadata?.is_l1)
const api = getAPI(layer)

const gasPricesQuery = createQuery({
  queryKey: ["GasPrices", api],
  queryFn: async () => {
    if (!api) throw new Error("API not found for layer 1")
    return createHTTPClient(api).get<Record<string, string>>("/indexer/price/v1/gas_prices")
  },
  enabled: isL1,
})

$: gasPrices = $gasPricesQuery.data ?? {}
$: feeTokens = layer.fees?.fee_tokens.map((feeToken) => {
  const { denom, fixed_min_gas_price, low_gas_price, average_gas_price, high_gas_price } = feeToken
  const gasPrice = getGasPrice(feeToken.denom, layer, gasPrices)
  return {
    denom,
    fixed_min_gas_price: fixed_min_gas_price ?? gasPrice,
    low_gas_price: low_gas_price ?? gasPrice,
    average_gas_price: average_gas_price ?? gasPrice,
    high_gas_price: high_gas_price ?? gasPrice,
  }
})

$: extendedLayer = feeTokens ? { ...layer, fees: { fee_tokens: feeTokens } } : layer
</script>

{#if !isL1 || $gasPricesQuery.isSuccess}
  <ConfirmTxComponent layer={extendedLayer} {gas} {skipPollingTx} {txBodyValue} {onSuccess} {onError} {reject} />
{:else}
  <div class="scroll center">
    <Loader />
  </div>
{/if}
