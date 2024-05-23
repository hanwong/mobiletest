<script lang="ts">
import { disconnect } from "../../../stores/actions"
import IconSignOut from "../../styles/icons/IconSignOut.svelte"
</script>

<footer class="footer">
  <button class="disconnect" on:click={disconnect}>
    <IconSignOut />
    Disconnect
  </button>
</footer>

<style>
footer {
  justify-content: center;
  padding: 12px 0 30px;
}

.disconnect {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  color: var(--gray-5);
  font-size: 12px;
  font-weight: 600;
  margin: -4px;
  padding: 4px;
  text-transform: uppercase;
}

.disconnect:hover {
  color: var(--gray-2);
}
</style>
