<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { LayerQueries } from "../../../shared/queries"

export let uri: string = ""
export let tokenId: string

const query = createQuery(LayerQueries.nftMetadata(uri))
$: ({ data } = $query)
</script>

{data?.name ?? tokenId}
