<script lang="ts">
import widget from "../widget"

const { signArbitrary, verifyArbitrary } = widget

let value = "Hello, world!"

let signed: string = ""
</script>

<button on:click={async () => (signed = await signArbitrary(value))}>Sign</button>
<input bind:value />

{#if signed}
  <pre>{signed}</pre>
  <button
    on:click={async () => {
      const verified = await verifyArbitrary(value, signed)
      window.alert(verified ? "Verified" : "Not verified")
    }}
  >
    Verify
  </button>
{/if}

<style>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
