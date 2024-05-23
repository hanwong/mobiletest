<script lang="ts">
import { getContext } from "svelte"
import type { Writable } from "svelte/store"
import { intlFormatDistance } from "date-fns"
import { calcChangesFromEvents } from "@initia/utils"
import { findLayer } from "../../utils"
import type { TxItem } from "../../../shared/queries"
import { address$ } from "../../../stores/state"
import IconWarning from "../../styles/icons/IconWarning.svelte"
import Group from "../../components/Group.svelte"
import Stack from "../../components/Stack.svelte"
import ActivityMessage from "./ActivityMessage.svelte"
import ActivityChange from "./ActivityChange.svelte"
import WithDenom from "./WithDenom.svelte"

export let txItem: TxItem
const { timestamp, code, tx, events } = txItem

$: address = $address$
$: selectedChainId = getContext<Writable<string>>("selectedChainId")
$: selectedLayer = findLayer($selectedChainId)!

$: changes = calcChangesFromEvents(events, address)
</script>

<div class="root">
  <div class="inner">
    <div class="timestamp">
      <div class="distance">
        <div>{intlFormatDistance(new Date(timestamp), new Date())}</div>
      </div>

      {#if code}
        <div class="error">
          <IconWarning size={12} />
          Failed
        </div>
      {/if}
    </div>

    <Group gap={8}>
      <div class="messages">
        <Stack gap={2}>
          {#each tx.body.messages as msg}
            <ActivityMessage {msg} />
          {/each}
        </Stack>
      </div>

      <div class="changes">
        {#each changes as { amount, metadata }}
          <WithDenom {metadata} layer={selectedLayer} let:denom>
            <ActivityChange {amount} {denom} layer={selectedLayer} />
          </WithDenom>
        {/each}
      </div>
    </Group>
  </div>
</div>

<style>
.root {
  color: unset;
  display: block;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  width: 100%;

  /* &:hover {
    background: var(--gray-7);
    text-decoration: none;
  } */

  &:first-of-type {
    margin-top: 16px;
  }
}

.inner {
  border-top: 1px dashed var(--gray-6);
  padding-top: 16px;
  padding-bottom: 32px;
  width: 100%;
}

.timestamp {
  border-radius: 10px;
  border: 1px solid var(--gray-8);
  background: var(--gray-6);
  color: var(--gray-2);
  font-size: 10px;
  font-weight: 700;
  height: 20px;
  padding: 2px 12px;
  position: absolute;
  top: -10px;
}

.error {
  display: flex;
  align-items: center;

  color: var(--danger);
  font-size: 10px;
}

.messages {
  flex: 1;
  width: calc(60% - 8px);
}

.changes {
  flex: none;
  width: 40%;
  text-align: right;
  font-size: 12px;
}
</style>
