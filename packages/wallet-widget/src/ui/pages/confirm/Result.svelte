<script lang="ts">
import { required } from "@initia/utils"
import { getState, navigate } from "../../../lib/router/routing"
import IconCheckCircleFilled from "../../styles/icons/IconCheckCircleFilled.svelte"

const result = required(getState<string | Error>())
const success = typeof result === "string"
</script>

<article class="scroll" class:center={success}>
  {#if result instanceof Error}
    <h1>Failed</h1>
    <pre class="reason">{result.message}</pre>
  {/if}

  {#if success}
    <div class="inner">
      <IconCheckCircleFilled size={50} />
      <h1>Success</h1>
    </div>
  {/if}
</article>

<footer class="footer">
  <button class="submit" on:click={() => navigate("/")}>Ok</button>
</footer>

<style>
.reason {
  color: var(--danger);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.center {
  display: grid;
  place-items: center;
}

.inner {
  display: grid;
  gap: 12px;
  place-items: center;
}

h1 {
  font-size: 24px;
  font-weight: 800;
}
</style>
