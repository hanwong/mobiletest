import { createHTTPClient } from "@initia/utils"
import init from "@initia/wallet-widget/src"

const layer = await createHTTPClient("https://omni-api.initiation-1.initia.xyz").get("/v1/registry/chains/layer1")
const widget = init({ layer })

export default widget
