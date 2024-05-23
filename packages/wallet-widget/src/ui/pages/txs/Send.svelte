<script lang="ts">
import { OmnitiaQueries } from "../../../shared/queries"
import SendForm from "./SendForm.svelte"

const { layer1 } = OmnitiaQueries.getInstance()
</script>

<SendForm {layer1} />
