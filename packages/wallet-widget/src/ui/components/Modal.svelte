<script lang="ts">
import { close } from "../../stores/actions"
import IconCircleCloseFilled from "../styles/icons/IconCircleCloseFilled.svelte"
import NoScroll from "./NoScroll.svelte"

export let title: string = ""
</script>

<NoScroll />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="backdrop" on:click={close}>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <main on:click|stopPropagation>
    {#if title}
      <header class="header">
        <h2 class="title">{title}</h2>
        <button class="close" on:click={close}><IconCircleCloseFilled /></button>
      </header>
    {/if}

    <div class="content">
      <slot />
    </div>
  </main>
</div>

<style>
.backdrop {
  background-color: var(--modal-backdrop-color);

  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid var(--modal-border-color);
  padding: 18px 24px;
}

main {
  position: relative;
  display: flex;
  flex-direction: column;

  max-width: 100vw;
  max-height: calc(100vh - 80px);
}

.title {
  font-size: 18px;
  font-weight: 700;
}

.close {
  display: flex;
  color: var(--gray-5);

  margin: -10px;
  padding: 10px;
}

.close:hover {
  color: var(--gray-2);
}

.content {
  flex: 1;
  overflow-y: auto;
}
</style>
