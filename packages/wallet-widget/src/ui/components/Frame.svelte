<div class="root">
  <slot />
</div>

<style>
.root {
  width: 375px;
  height: 600px;
  max-width: 100vw;
  max-height: calc(100vh - 80px);
  overflow: hidden;

  display: flex;
  flex-direction: column;
}
</style>
