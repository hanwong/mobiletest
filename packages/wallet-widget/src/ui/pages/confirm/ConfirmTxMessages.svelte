<script lang="ts">
import { summarizeMessage, type EncodeObject, truncate, stringifyMessageValue } from "@initia/utils"
import Accordion from "../../components/Accordion.svelte"
import AccordionItem from "../../components/AccordionItem.svelte"

export let messages: EncodeObject[]

let opened: number[] = []

$: collapse = (index: number) => {
  if (opened.includes(index)) {
    opened = opened.filter((i) => i !== index)
  } else {
    opened = [...opened, index]
  }
}
</script>

<Accordion>
  {#each messages as message, index}
    {@const [title, description] = summarizeMessage(message)}
    <AccordionItem
      title="{title} {description ? `(${truncate(description)})` : ''}"
      isOpen={opened.includes(index)}
      on:click={() => collapse(index)}
    >
      <dl>
        {#each Object.entries(message.value) as [key, value]}
          <dt>{key}</dt>
          <dd>{stringifyMessageValue(value)}</dd>
        {/each}
      </dl>
    </AccordionItem>
  {/each}
</Accordion>

<style>
dl {
  font-size: 12px;
  font-weight: 600;
  padding: 20px;
}

dt:not(:first-child) {
  margin-top: 16px;
}

dd {
  color: var(--gray-3);
  word-wrap: break-word;
}
</style>
