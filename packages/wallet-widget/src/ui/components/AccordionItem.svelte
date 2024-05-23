<script lang="ts">
import { slide } from "svelte/transition"
import IconChevronDown from "../styles/icons/IconChevronDown.svelte"
import Image from "./Image.svelte"

export let icon: string = ""
export let title: string
export let isOpen = false
</script>

<article class="root">
  <button class="header" on:click>
    <h2>
      {#if icon}<Image src={icon} height={16} />{/if}
      {title}
    </h2>

    <span class="chevron" class:rotate={isOpen}>
      <IconChevronDown />
    </span>
  </button>

  {#if isOpen}
    <div class="content" transition:slide={{ duration: 150 }}>
      <slot />
    </div>
  {/if}
</article>

<style>
.root {
  --border-radius: 20px;

  display: grid;

  background: var(--gray-8);
  border: 1px solid var(--gray-6);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: var(--gray-7);
  color: var(--gray-2);
  padding: 16px 20px;
  font-size: 13px;
  font-weight: 600;
}

.content {
  border-top: 1px solid var(--gray-6);
}

h2 {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chevron {
  display: flex;
  color: var(--gray-4);
}

.rotate {
  transform: rotate(180deg);
}
</style>
