<script lang="ts">
import { getContext } from "svelte"
import type { Writable } from "svelte/store"
import BigNumber from "bignumber.js"
import { createMutation, createQuery } from "@tanstack/svelte-query"
import { calculateFee } from "@cosmjs/stargate"
import { formatAmount, required, type TxBodyValue } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { toGasPrice } from "../../../layers/InitiaLayer"
import { STORAGE_KEYS } from "../../../shared/constants"
import { LayerQueries } from "../../../shared/queries"
import { address$, wallet$ } from "../../../stores/state"
import { getSigner } from "../../../stores/actions"
import { multiplier } from "../../../stores/config"
import Stack from "../../components/Stack.svelte"
import Loader from "../../components/Loader.svelte"
import TokenSymbol from "../../components/TokenSymbol.svelte"
import ConfirmTxMessages from "./ConfirmTxMessages.svelte"
import SelectWrapper from "../../components/SelectWrapper.svelte"

export let layer: Chain
export let txBodyValue: TxBodyValue
export let gas: number | undefined
export let skipPollingTx: boolean | undefined = false
export let onSuccess: (data: string) => void
export let onError: (error: Error) => void
export let reject: () => void

const { messages, memo } = txBodyValue

$: wallet = required($wallet$)

function isDenomValid(denom?: string) {
  return layer.fees?.fee_tokens?.some((token) => token.denom === denom)
}

function getInitialDenom() {
  const storedFeeDenomsString = localStorage.getItem(STORAGE_KEYS.FEE_DENOMS)

  if (storedFeeDenomsString) {
    const storedFeeDenoms = JSON.parse(storedFeeDenomsString)
    const storedFeeDenom = storedFeeDenoms[layer.chain_id]
    if (isDenomValid(storedFeeDenom)) return storedFeeDenom
  }

  return layer.fees?.fee_tokens[0].denom
}

function storeFeeDenom(denom: string) {
  const storedFeeDenomsString = localStorage.getItem(STORAGE_KEYS.FEE_DENOMS)
  const storedFeeDenoms = storedFeeDenomsString ? JSON.parse(storedFeeDenomsString) : {}
  storedFeeDenoms[layer.chain_id] = denom
  localStorage.setItem(STORAGE_KEYS.FEE_DENOMS, JSON.stringify(storedFeeDenoms))
}

let feeDenom = required(getInitialDenom())

$: storeFeeDenom(feeDenom)

const estimatedGasQuery = createQuery({
  // not reactive because the estimation is fixed for the parameters
  queryKey: ["fee", txBodyValue],
  queryFn: async () => {
    if (gas) return gas
    const signer = await getSigner(wallet, layer)
    await signer.connect()
    return await signer.estimateGas(txBodyValue)
  },
})

$: estimatedGas = $estimatedGasQuery.data

$: fee = estimatedGas ? calculateFee(Math.ceil(estimatedGas * multiplier), toGasPrice(layer, feeDenom)) : undefined

const address = $address$
const balanceQuery = createQuery(LayerQueries.getInstance(layer).balances(address)) // not reactive because the balance is fixed for the address
$: balance = $balanceQuery.data?.find((balance) => balance.denom === feeDenom)?.amount ?? "0"
$: feeAmount = fee?.amount[0].amount
$: isBalanceEnough = feeAmount ? BigNumber(balance).gt(feeAmount) : undefined

$: isTxBroadcasted = getContext<Writable<boolean> | undefined>("isTxBroadcasted")
$: mutation = createMutation({
  mutationFn: async () => {
    const signer = await getSigner(wallet, layer)
    await signer.connect()
    const tx = await signer.signTx(txBodyValue, required(fee))
    const transactionHash = await signer.broadcastTx(tx)
    if (skipPollingTx) return transactionHash
    await signer.pollTx(transactionHash)
    return transactionHash
  },
  onMutate: () => isTxBroadcasted?.set(true),
  onSuccess,
  onError,
})

$: approve = () => {
  $mutation.mutate()
}

$: disabled = !fee || $mutation.isPending || !isBalanceEnough
</script>

<div class="scroll">
  <Stack gap={28}>
    <section class="meta">
      {#if $estimatedGasQuery.error}
        <p class="danger" style="word-wrap: break-word;">{$estimatedGasQuery.error.message}</p>
      {:else}
        <dl>
          {#if memo}
            <dt>Memo</dt>
            <dd>{memo}</dd>
          {/if}
          <dt>Fee</dt>
          <dd>
            {#if $estimatedGasQuery.isLoading}
              Loading...
            {:else if fee}
              <span class:danger={!isBalanceEnough}>{formatAmount(feeAmount)}</span>
              <SelectWrapper inline>
                <select bind:value={feeDenom}>
                  {#each required(layer.fees?.fee_tokens) as { denom }}
                    <option value={denom}>
                      <TokenSymbol {layer} {denom} />
                    </option>
                  {/each}
                </select>
              </SelectWrapper>
            {/if}
          </dd>
        </dl>
      {/if}
    </section>

    <ConfirmTxMessages {messages} />
  </Stack>
</div>

<footer class="footer">
  <button class="submit" on:click={approve} {disabled}>
    {#if $mutation.isPending}
      <Loader />
    {:else}
      Approve
    {/if}
  </button>
  <button class="submit invert" on:click={reject} disabled={$mutation.isPending}>Reject</button>
</footer>

<style>
.meta {
  font-size: 12px;
  font-weight: 600;
}

dl {
  display: grid;
  grid-template-columns: auto auto;
  gap: 16px;
}

dt {
  color: var(--gray-3);
}

dd {
  grid-column: 2;
  color: var(--gray-1);
  text-align: right;
}

select {
  padding-right: 16px;
}

.footer {
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
}
</style>
