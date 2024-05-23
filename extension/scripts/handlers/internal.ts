import type { StdFee } from "@cosmjs/stargate"
import type { Chain } from "@initia/initia-registry-types"
import type { CreateAccountParams, Preferences, RequestMethod, SignAndBroadcastArgs, SignParams } from "../types"
import KeyringController from "../controllers/KeyringController"
import {
  accountsController,
  arbitraryController,
  layersController,
  permissionController,
  preferencesController,
  signDocController,
  txController,
  vaultController,
} from "../data/controllers"

const handleRequest: RequestMethod = async (method, args) => {
  switch (method) {
    /* vault */
    case "getInitialized":
      return vaultController.getInitialized()
    case "initializeVault":
      return vaultController.initialize(args as string)
    case "changePassword":
      const { oldPassword, newPassword } = args as { oldPassword: string; newPassword: string }
      return vaultController.changePassword(oldPassword, newPassword)
    case "getLocked":
      return vaultController.locked
    case "lock":
      return vaultController.lock()
    case "unlock":
      return vaultController.unlock(args as string)

    /* accounts */
    case "getInitiaAddress":
      return accountsController.initiaAddress
    case "getChainAddress":
      return accountsController.initiaAddress
    case "getCurrentChainAddress":
      return accountsController.initiaAddress
    case "getAccount":
      return accountsController.account
    case "setAccount":
      return accountsController.selectAccount(args as string)
    case "getAccounts":
      return accountsController.accounts
    case "createAccount":
      return KeyringController.addAccount(args as CreateAccountParams)
    case "changeAccountName":
      const { address, name } = args as { address: string; name: string }
      return accountsController.changeAccountName(address, name)
    case "deleteAccount":
      return KeyringController.deleteAccount(args as string)

    /* layers */
    case "initLayers":
      return layersController.init()
    case "getLayers":
      return layersController.layers
    case "getRegisteredLayers":
      return layersController.customLayers
    case "getCustomLayers":
      return layersController.customLayers
    case "addLayer":
      return layersController.addLayer(args as Chain)
    case "addCustomLayer":
      return layersController.addCustomLayer(args as Chain)
    case "deleteLayer":
      return layersController.deleteLayer(args as string)

    /* requested: permission */
    case "getRequestedPermission":
      return permissionController.requested
    case "approveRequestedPermission":
      return permissionController.approve()
    case "rejectRequestedPermission":
      return permissionController.reject()
    case "getAuthorizedPermission":
      return permissionController.authorized
    case "deleteAuthorizedPermission":
      return permissionController.forget(args as string)

    /* requested: addChain */
    case "getRequestedLayer":
      return layersController.requested
    case "approveRequestedLayer":
      return layersController.approve()
    case "rejectRequestedLayer":
      return layersController.reject()

    /* requested: signDoc */
    case "getRequestedSignDoc":
      return signDocController.requested
    case "approveRequestedSignDoc":
      return signDocController.approve()
    case "rejectRequestedSignDoc":
      return signDocController.reject()

    /* requested: tx */
    case "getRequestedTx":
      return txController.requested
    case "approveRequestedTx":
      return txController.approve(args as StdFee)
    case "rejectRequestedTx":
      return txController.reject()

    /* requested: arbitrary */
    case "getRequestedArbitrary":
      return arbitraryController.requested
    case "approveRequestedArbitrary":
      return arbitraryController.approve()
    case "rejectRequestedArbitrary":
      return arbitraryController.reject()

    /* tx */
    case "simulateCosmosTx":
      return vaultController.simulateCosmosTx(args as SignAndBroadcastArgs)
    case "signAndBroadcastCosmosTx":
      return vaultController.signAndBroadcastCosmosTxBlock(args as SignParams)
    case "getPrivateKey":
      return vaultController.getPrivateKey(args as string)

    /* preferences */
    case "getPreferences":
      return preferencesController.preferences
    case "setPreferences":
      return preferencesController.set(args as Preferences)

    default:
      throw new Error(`Unknown method: ${method}`)
  }
}

export default handleRequest
