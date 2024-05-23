<script lang="ts">
import { MemoryRouter } from "../../lib/router"
import Frame from "../components/Frame.svelte"
import routes from "../routes"
</script>

<Frame>
  <MemoryRouter {routes} />
</Frame>
