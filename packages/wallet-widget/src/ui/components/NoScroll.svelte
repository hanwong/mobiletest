<script lang="ts">
import { onMount } from "svelte"

onMount(() => {
  const overflow = document.body.style.overflow
  document.body.style.overflow = "hidden"
  return () => {
    document.body.style.overflow = overflow
  }
})
</script>
