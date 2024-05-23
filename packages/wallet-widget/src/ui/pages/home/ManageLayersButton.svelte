<script>
import { navigate } from "../../../lib/router"
import IconSettings from "../../styles/icons/IconSettings.svelte"
</script>

<button on:click={() => navigate("/layers")}>
  <IconSettings size={10} />
  <span>Manage my Minitias</span>
</button>

<style>
button {
  display: flex;
  align-items: center;
  gap: 6px;

  border: 1px dashed var(--gray-6);
  border-radius: 20px;
  color: var(--gray-4);
  font-size: 12px;
  font-weight: 600;
  padding: 18px 20px;
}

button:hover {
  background: var(--gray-8);
}
</style>
