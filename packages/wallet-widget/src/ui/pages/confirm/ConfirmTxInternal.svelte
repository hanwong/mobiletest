<script lang="ts">
import { required, type TxBodyValue } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { getState, goBack, navigate } from "../../../lib/router/routing"
import Page from "../../components/Page.svelte"
import ConfirmTxContainer from "./ConfirmTxContainer.svelte"

const state = required(getState<{ layer: Chain; txBodyValue: TxBodyValue }>())
</script>

<Page title="Confirm Tx">
  <ConfirmTxContainer
    {...state}
    onSuccess={(transactionHash) => navigate("/result", transactionHash)}
    onError={(error) => navigate("/result", error)}
    reject={goBack}
  />
</Page>
