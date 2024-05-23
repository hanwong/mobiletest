import type { Chain } from "@initia/initia-registry-types"
import { ChainSchema } from "@initia/initia-registry-types/zod"
import type { RequestMethod, Sender, DirectSignArgs, SignAndBroadcastArgs } from "../types"
import { SignAndBroadcastArgsSchema } from "../types"
import registry from "../cosmos/registry"
import {
  accountsController,
  arbitraryController,
  layersController,
  permissionController,
  signDocController,
  txController,
} from "../data/controllers"

function handleRequest(sender: Sender): RequestMethod {
  return async (method, args) => {
    if (!permissionController.getIsAuthorized(sender.url)) {
      await permissionController.request(sender)
    }

    const checkSignAndBroadcastArgs = (args: SignAndBroadcastArgs) => {
      if (!layersController.findLayer(args.chainId)) {
        throw new Error(`Layer ${args.chainId} does not exist`)
      }

      if (!SignAndBroadcastArgsSchema.safeParse(args).success) {
        throw new Error("Arguments are invalid")
      }

      try {
        registry.decodeTxBody(args.txBody)
      } catch {
        throw new Error("Tx not registered")
      }
    }

    switch (method) {
      case "requestAddress":
        return accountsController.initiaAddress

      case "requestAccount":
        return accountsController.account

      case "requestSign":
        return signDocController.request(args as DirectSignArgs, sender.url)

      case "requestSignAndBroadcastSync":
        checkSignAndBroadcastArgs(args as SignAndBroadcastArgs)
        return txController.request(args as SignAndBroadcastArgs, sender, "sync")

      case "requestSignAndBroadcastBlock":
        checkSignAndBroadcastArgs(args as SignAndBroadcastArgs)
        return txController.request(args as SignAndBroadcastArgs, sender, "block")

      case "requestSignAndBroadcast":
        checkSignAndBroadcastArgs(args as SignAndBroadcastArgs)
        return txController.request(args as SignAndBroadcastArgs, sender, "block")

      case "requestAddInitiaLayer":
        if (!ChainSchema.safeParse(args).success) {
          throw new Error("Chain schema is invalid")
        }

        return layersController.request(args as Chain, sender)

      case "requestSignArbitrary":
        return arbitraryController.request(args as string | Uint8Array)

      case "requestVerifyArbitrary":
        return arbitraryController.verify(args as { data: string | Uint8Array; sig: string })

      default:
        throw new Error(`Unknown method: ${method}`)
    }
  }
}

export default handleRequest
