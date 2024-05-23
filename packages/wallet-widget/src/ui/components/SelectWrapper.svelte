<script lang="ts">
import IconChevronDown from "../styles/icons/IconChevronDown.svelte"

export let iconSize: number = 16
export let iconRight: number = 0
export let inline: boolean = false
</script>

<div class="wrapper" class:inline>
  <slot />

  <div class="icon" style:right="{iconRight}px">
    <IconChevronDown size={iconSize} />
  </div>
</div>

<style>
.wrapper {
  position: relative;
}

.inline {
  display: inline-flex;
}

.icon {
  display: flex;
  pointer-events: none;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  color: var(--gray-5);
}
</style>
