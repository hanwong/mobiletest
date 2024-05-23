<script lang="ts">
import createStyle from "../styles/createStyle"

export let gap = 0
export let m = 0
export let mx = 0
export let my = 0
export let p = 0
export let px = 0
export let py = 0

let style = createStyle({ gap, m, mx, my, p, px, py })
</script>

<div class="root" {style}>
  <slot />
</div>

<style>
.root {
  display: flex;
  align-items: center;
}
</style>
