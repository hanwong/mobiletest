<script lang="ts" context="module">
function camelcaseKeys(input: Record<string, unknown>) {
  const output: Record<string, unknown> = {}

  for (const key in input) {
    const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    output[camelCaseKey] = input[key]
  }

  return output
}
</script>

<script lang="ts">
import { registryTypes, summarizeMessage, truncate } from "@initia/utils"

export let msg: { "@type": string; [key: string]: unknown }

const typeUrl = msg["@type"]
// @ts-expect-error // The data received from API is not a valid protobuf message
const value = new Map(registryTypes).get(typeUrl)?.fromJSON(camelcaseKeys(msg))
const [title, subtitle] = summarizeMessage({ typeUrl, value })
</script>

<div class="message">
  {title}

  {#if subtitle}
    <span class="subtitle">
      {` (${truncate(subtitle)})`}
    </span>
  {/if}
</div>

<style>
.message {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  color: var(--gray-3);
  font-size: 12px;
}
</style>
