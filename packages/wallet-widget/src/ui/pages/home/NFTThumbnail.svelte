<script lang="ts">
import { createQuery } from "@tanstack/svelte-query"
import { LayerQueries } from "../../../shared/queries"
import Image from "../../components/Image.svelte"

export let uri: string = ""
export let size: number | undefined = undefined

const query = createQuery(LayerQueries.nftMetadata(uri))
$: ({ data } = $query)
</script>

<div>
  <Image src={data?.image} height={size} />
</div>

<style>
div {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
}
</style>
