import bcs from "../../initia/bcs"
import createInitiaMoveClient from "../move/Move"

function createInitiaDexUtilsClient(rest: string, moduleAddress: string) {
  const client = createInitiaMoveClient(rest)

  const moduleName = "dex_utils"

  function getSwapSimulation(offerToken: string, lpToken: string) {
    return async function (amount: string) {
      return client.view<[string, string]>({
        moduleAddress,
        moduleName,
        functionName: "get_swap_simulation",
        type_args: [],
        args: [
          bcs.address().serialize(lpToken).toBase64(),
          bcs.address().serialize(offerToken).toBase64(),
          bcs.u64().serialize(amount).toBase64(),
        ],
      })
    }
  }

  function getRouteSwapSimulation(offerToken: string, lpTokens: [string, string]) {
    return async function (amount: string) {
      return client.view<[string, string]>({
        moduleAddress,
        moduleName,
        functionName: "get_route_swap_simulation",
        type_args: [],
        args: [
          bcs.address().serialize(offerToken).toBase64(),
          bcs.vector(bcs.address()).serialize(lpTokens).toBase64(),
          bcs.u64().serialize(amount).toBase64(),
        ],
      })
    }
  }

  return {
    rest,
    getSwapSimulation,
    getRouteSwapSimulation,
  }
}

export default createInitiaDexUtilsClient
