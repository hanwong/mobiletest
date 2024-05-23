<script lang="ts">
import { validateSlippage } from "@initia/utils"

export let value: number
</script>

<button
  type="button"
  class="slippage"
  on:click={() => {
    const input = window.prompt("Enter slippage percentage", String(value))
    if (!input) return
    const { type, message } = validateSlippage(input)
    if (message) window.alert(message)
    if (type === "error") return
    value = Number(input)
  }}
>
  Slippage <span class="underline">{value}%</span>
</button>

<style>
.slippage {
  color: var(--gray-1);
  font-size: 12px;
  font-weight: 700;
  padding: 10px;
}
</style>
