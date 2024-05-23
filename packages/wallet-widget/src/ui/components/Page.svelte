<script lang="ts">
import GoBack from "../components/GoBack.svelte"

export let title = ""
</script>

<header>
  <GoBack />
  <h1>{title}</h1>
</header>

<slot />

<style>
header {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 15px 20px;
}

h1 {
  color: white;
  font-size: 14px;
  font-weight: 700;
}
</style>
