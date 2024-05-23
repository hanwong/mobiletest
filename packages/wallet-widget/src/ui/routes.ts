import type { SvelteComponent } from "svelte"
import NotFound from "./pages/NotFound.svelte"
import Home from "./pages/home/Home.svelte"
import ManageLayers from "./pages/home/ManageLayers.svelte"
import NftCollectionDetails from "./pages/home/NFTCollectionDetails.svelte"
import NftTokenDetails from "./pages/home/NFTTokenDetails.svelte"
import Send from "./pages/txs/Send.svelte"
import Swap from "./pages/txs/Swap.svelte"
import ConfirmTxInternal from "./pages/confirm/ConfirmTxInternal.svelte"
import Result from "./pages/confirm/Result.svelte"

const routes = {
  "/": Home as typeof SvelteComponent,
  "/layers": ManageLayers as typeof SvelteComponent,
  "/collection": NftCollectionDetails as typeof SvelteComponent,
  "/nft": NftTokenDetails as typeof SvelteComponent,
  "/send": Send as typeof SvelteComponent,
  "/swap": Swap as typeof SvelteComponent,
  "/confirm": ConfirmTxInternal as typeof SvelteComponent,
  "/result": Result as typeof SvelteComponent,

  "/*": NotFound as typeof SvelteComponent,
}

export default routes
