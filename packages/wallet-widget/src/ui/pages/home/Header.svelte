<script lang="ts">
import { wallet$ } from "../../../stores/state"
import CopyAddress from "../../components/CopyAddress.svelte"
import Image from "../../components/Image.svelte"

$: wallet = $wallet$
</script>

<header>
  <section class="logo">
    <Image src={wallet?.logo} alt={wallet?.loginProvider?.label ?? wallet?.name} width={18} height={18} />
  </section>

  <section class="user">
    <CopyAddress />
  </section>
</header>

<style>
header {
  --size: 42px;

  display: flex;
  border-bottom: 1px solid var(--gray-7);
  height: var(--size);
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
}

.user {
  border-left: 1px solid var(--gray-7);

  flex: 1;
  color: var(--gray-2);
  font-size: 12px;
  font-weight: 600;

  display: grid;
}
</style>
