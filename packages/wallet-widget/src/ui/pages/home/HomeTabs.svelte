<script lang="ts">
import { createEventDispatcher } from "svelte"

const dispatch = createEventDispatcher()

export let tabs: { id: string; label: string }[]
export let currentTab: string
</script>

<nav>
  {#each tabs as tab}
    <button class:active={tab.id === currentTab} on:click={() => dispatch("select", tab.id)}>
      {tab.label}
    </button>
  {/each}
</nav>

<style>
nav {
  display: flex;
  justify-content: center;
  gap: 28px;
}

button {
  border-bottom: 2px solid transparent;
  color: var(--gray-5);
  font-size: 18px;
  font-weight: 700;
  padding: 0 2px;
}

button:hover {
  color: var(--gray-2);
}

button.active {
  color: var(--gray-0);
  border-color: var(--gray-0);
}
</style>
