<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { AddressUtils, isUsernameValid } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { LayerQueries } from "../../../../shared/queries"
import { address$ } from "../../../../stores/state"

const address = $address$

export let recipientAddress: string
export let layer1: Chain

let value = ""

$: addressFromUsernameQuery = createQuery({
  ...LayerQueries.getInstance(layer1).addressFromUsername(value),
  enabled: isUsernameValid(value),
})

$: addressFromUsername = $addressFromUsernameQuery.data

$: {
  if (addressFromUsername) {
    recipientAddress = addressFromUsername
  } else if (AddressUtils.isValid(value)) {
    recipientAddress = value
  } else {
    recipientAddress = ""
  }
}
</script>

<div>
  <label for="recipient">Recipient</label>
  <input type="text" id="recipient" placeholder="init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs" bind:value />

  <footer>
    <div class="address">
      {#if $addressFromUsernameQuery.isFetching}
        <span>Checking username...</span>
      {:else if isUsernameValid(value) && !addressFromUsername}
        <span class="danger">Invalid username</span>
      {:else if addressFromUsername}
        <span class="success">{addressFromUsername}</span>
      {/if}
    </div>

    <div class="shortcuts">
      <button type="button" class="shortcut" on:click={() => (value = address)}>Me</button>
    </div>
  </footer>
</div>

<style>
footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.address {
  font-size: 0.75em;
  font-weight: 700;
}

.shortcuts {
  display: flex;
  justify-content: flex-end;
}

.shortcut {
  background: var(--gray-8);
  border-radius: 12px;
  border: 1px solid var(--gray-7);
  color: var(--gray-3);
  font-size: 11px;
  font-weight: 600;
  height: 24px;
  padding: 0 12px;
}

.shortcut:hover {
  color: var(--gray-0);
}
</style>
