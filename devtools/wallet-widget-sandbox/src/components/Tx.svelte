<script lang="ts">
import { type EncodeObject } from "@initia/utils"
import widget from "../widget"
import { TxMessages } from "./messages"

const { address$, requestTx } = widget

let isLoading = false

$: address = $address$
$: send = TxMessages.send({ address, recipientAddress: address, denom: "uinit" })

$: submit = async (messages: EncodeObject[]) => {
  try {
    isLoading = true
    const txBodyValue = { messages }
    const result = await requestTx(txBodyValue)
    window.alert(result)
  } catch (error) {
    if (error instanceof Error) window.alert(error.message)
    else throw error
  } finally {
    isLoading = false
  }
}
</script>

<button on:click={() => submit(send)} disabled={isLoading}>Send</button>
