<script lang="ts" context="module">
function styleToString(style: Record<string, string | undefined>) {
  return Object.entries(style)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(";")
}
</script>

<script lang="ts">
export let src: string = ""
export let alt: string = ""
export let width: number | undefined = undefined
export let height: number | undefined = undefined

let hasError: boolean = false

function handleError() {
  hasError = true
}

const styleObject = {
  width: width ? `${width}px;` : height ? `${height}px` : undefined,
  height: height ? `${height}px` : undefined,
}

const style = styleToString(styleObject)
</script>

{#if src && !hasError}
  <img {src} {alt} {width} {height} on:error={handleError} />
{:else}
  <div class="placeholder" {style} />
{/if}

<style>
.placeholder {
  background-color: var(--gray-6);
}
</style>
