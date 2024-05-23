<script lang="ts">
import type { Wallet } from "../../shared/wallets"

export let wallet: Wallet
export let error: Error | undefined

$: name = wallet.loginProvider?.label ?? wallet.name
$: title = error ? "Connection Failed" : `Connecting to ${name}`
$: content = error ? error.message : "Waiting for approval from the wallet"
</script>

<div class="wrapper">
  <article>
    <img src={wallet.logo} alt={name} width="40" height="40" />
    <div style="height: 14px;" />
    <section>{title}</section>
    <p>{content}</p>

    {#if error}
      <div style="height: 14px;" />
      <button class="submit" on:click>Retry</button>
    {/if}
  </article>
</div>

<style>
.wrapper {
  @media screen and (min-width: 576px) {
    width: 580px;
  }

  width: 280px;
  height: 360px;

  display: grid;
  place-items: center;
}

article {
  display: grid;
  place-items: center;
  gap: 8px;
}

section {
  font-size: 14px;
  font-weight: 700;
}

p {
  color: var(--gray-3);
  font-size: 12px;
  font-weight: 600;
  word-break: break-all;
}

button {
  min-width: 210px;
}
</style>
