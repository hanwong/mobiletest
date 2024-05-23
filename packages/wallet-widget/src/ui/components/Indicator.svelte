<script lang="ts">
import { close } from "../../stores/actions"
import { layer } from "../../stores/config"
import IconClose from "../styles/icons/IconClose.svelte"
</script>

<section class="connected-to">
  connected to <span class="chain-name">{layer.pretty_name ?? layer.chain_name}</span>

  <button on:click={close} class="close">
    <IconClose size={12} />
  </button>
</section>

<style>
.connected-to {
  background: white;
  border-bottom: 1px solid var(--gray-7);
  color: var(--gray-4);
  font-size: 10px;
  font-weight: 700;
  line-height: 24px;
  text-align: center;

  position: relative;
}

.chain-name {
  color: black;
}

.close {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);

  display: flex;
}
</style>
