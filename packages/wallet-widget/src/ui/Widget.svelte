<script lang="ts">
import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query"
import InitiaSigner from "../signers/initia/InitiaSigner"
import KeplrSigner from "../signers/keplr/KeplrSigner"
import EthereumSigner from "../signers/ethereum/EthereumSigner"
import InitiaMobileSigner from "../signers/initia/InitiaMobileSigner"
import { address$, opened$, signer$ } from "../stores/state"
import { disconnect } from "../stores/actions"
import ResetCss from "./styles/ResetCss.svelte"
import GlobalStyle from "./styles/GlobalStyle.svelte"
import ComponentsStyle from "./styles/ComponentsStyle.svelte"
import Modal from "./components/Modal.svelte"
import Popover from "./components/Popover.svelte"
import WalletList from "./pages/WalletList.svelte"
import ConnectedWallet from "./pages/ConnectedWallet.svelte"
import ConfirmTxExternal from "./pages/confirm/ConfirmTxExternal.svelte"
import Initialized from "./Initialized.svelte"
import Reconnected from "./Reconnected.svelte"

const queryClient = new QueryClient()

$: signer = $signer$
$: opened = $opened$

$: updateAddress = async () => {
  if (signer) address$.next(await signer.getAddress())
}

$: if (signer instanceof InitiaSigner) window.addEventListener("initia_addressChanged", updateAddress)
$: if (signer instanceof KeplrSigner) window.addEventListener("keplr_keystorechange", updateAddress)
$: if (signer instanceof EthereumSigner) window.ethereum?.on("accountsChanged", updateAddress)
$: if (signer instanceof InitiaMobileSigner) {
  window.addEventListener("wc_addressChanged", updateAddress)
  window.addEventListener("wc_disconnected", disconnect)
}
</script>

<ResetCss />
<GlobalStyle />
<ComponentsStyle />

<QueryClientProvider client={queryClient}>
  {#if opened?.component === "WalletList"}
    <Modal title="Connect to a Wallet">
      <Reconnected>
        <WalletList />
      </Reconnected>
    </Modal>
  {:else if opened?.component === "RequestTx"}
    <Modal>
      <Initialized>
        <ConfirmTxExternal {...opened.requested} />
      </Initialized>
    </Modal>
  {:else if opened?.component === "ConnectedWallet"}
    <Popover style={opened.style}>
      <Initialized>
        <ConnectedWallet />
      </Initialized>
    </Popover>
  {/if}
</QueryClientProvider>
