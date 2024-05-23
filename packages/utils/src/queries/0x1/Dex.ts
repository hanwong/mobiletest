import bcs from "../../initia/bcs"
import createInitiaMoveClient from "../move/Move"

function createInitiaDexClient(rest: string) {
  const client = createInitiaMoveClient(rest)

  const moduleAddress = "0x1"
  const moduleName = "dex"

  async function getConfig(liquidityToken: string) {
    return client.view<{ swap_fee_rate: string }>({
      moduleAddress,
      moduleName,
      functionName: "get_config",
      type_args: [],
      args: [bcs.address().serialize(liquidityToken).toBase64()],
    })
  }

  async function getSpotPrice(offerToken: string, liquidityToken: string) {
    return client.view<string>({
      moduleAddress,
      moduleName,
      functionName: "get_spot_price",
      type_args: [],
      args: [bcs.address().serialize(liquidityToken).toBase64(), bcs.address().serialize(offerToken).toBase64()],
    })
  }

  return {
    rest,
    getConfig,
    getSpotPrice,
  }
}

export default createInitiaDexClient
