import VaultController from "../controllers/VaultController"
import AccountsController from "../controllers/AccountsController"
import LayersController from "../controllers/LayersController"
import PermissionController from "../controllers/PermissionController"
import SignDocController from "../controllers/SignDocController"
import TxController from "../controllers/TxController"
import ArbitraryController from "../controllers/ArbitraryController"
import PreferencesController from "../controllers/PreferencesController"

export const vaultController = new VaultController()
export const accountsController = new AccountsController()
export const layersController = new LayersController()
export const permissionController = new PermissionController()
export const signDocController = new SignDocController()
export const txController = new TxController()
export const arbitraryController = new ArbitraryController()
export const preferencesController = new PreferencesController()
