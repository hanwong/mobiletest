<script lang="ts">
import { goBack } from "../../lib/router/routing"
import IconBack from "../styles/icons/IconBack.svelte"
</script>

<button on:click={goBack}>
  <IconBack size={12} />
</button>

<style>
button {
  display: flex;
  color: var(--gray-1);
  margin: -15px;
  padding: 15px;
}

button:hover {
  color: var(--gray-0);
}
</style>
