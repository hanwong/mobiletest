<script lang="ts">
import { onDestroy, setContext } from "svelte"
import { writable } from "svelte/store"
import { type TxBodyValue } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import Frame from "../../components/Frame.svelte"
import Header from "../home/Header.svelte"
import ConfirmTxContainer from "./ConfirmTxContainer.svelte"

export let layer: Chain
export let txBodyValue: TxBodyValue
export let gas: number | undefined
export let skipPollingTx: boolean
export let resolve: (data: string) => void
export let reject: (error: Error) => void

let isTxBroadcasted = writable(false)
setContext("isTxBroadcasted", isTxBroadcasted)

onDestroy(() => {
  if (!$isTxBroadcasted) {
    reject(new Error("User rejected"))
  }
})
</script>

<Frame>
  <Header />
  <ConfirmTxContainer
    {layer}
    {txBodyValue}
    {gas}
    {skipPollingTx}
    onSuccess={resolve}
    onError={reject}
    reject={() => reject(new Error("User rejected"))}
  />
</Frame>
