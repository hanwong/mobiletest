import App from "./app/App"

/* home */
import Home from "./pages/home/Home"
import ManageLayers from "./pages/home/ManageLayers"
import CollectionDetails from "./pages/collectibles/CollectionDetails"
import CollectibleTokenDetails from "./pages/collectibles/CollectibleTokenDetails"

/* header */
import Chains from "./pages/home/menu/Chains"
import Accounts from "./pages/home/menu/Accounts"
import Settings from "./pages/home/menu/Settings"
import ExportPrivateKey from "./pages/settings/ExportPrivateKey"

/* onboard */
import Onboard from "./pages/onboard/Onboard"
import SocialLogin from "./pages/onboard/SocialLogin"
import CreateAccount from "./pages/onboard/CreateAccount"
import ConfirmMnemonic from "./pages/onboard/ConfirmMnemonic"
import ImportMnemonic from "./pages/onboard/ImportMnemonic"
import ImportPrivateKey from "./pages/onboard/ImportPrivateKey"

/* txs */
import Send from "./pages/txs/Send"
import SendCollectibles from "./pages/txs/SendCollectibles"
import Swap from "./pages/txs/Swap"
import ConfirmTxFromInternal from "./pages/confirm/ConfirmTxFromInternal"

/* settings */
import Contacts from "./pages/settings/Contacts/Contacts"
import AddContact from "./pages/settings/Contacts/AddContact"
import EditContact from "./pages/settings/Contacts/EditContact"
import ConnectedSites from "./pages/settings/ConnectedSites"
import Password from "./pages/settings/Password"
import Advanced from "./pages/settings/Advanced"
import About from "./pages/settings/About"

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      /* home */
      { index: true, element: <Home /> },
      { path: "layers", element: <ManageLayers /> },
      { path: "collection/:collectionAddress", element: <CollectionDetails /> },
      { path: "collection/:collectionAddress/:tokenAddress", element: <CollectibleTokenDetails /> },

      /* header */
      { path: "chains", element: <Chains /> },
      { path: "accounts", element: <Accounts /> },

      /* onboard */
      { path: "onboard", element: <Onboard /> },
      {
        path: "account/*",
        children: [
          { path: "new", element: <CreateAccount /> },
          { path: "new/confirm", element: <ConfirmMnemonic /> },
          { path: "import/mnemonic", element: <ImportMnemonic /> },
          { path: "import/private-key", element: <ImportPrivateKey /> },
          { path: "social", element: <SocialLogin /> },
          { path: "export/private-key/:address", element: <ExportPrivateKey /> },
        ],
      },

      /* tx */
      { path: "send", element: <Send /> },
      { path: "send/collection/:collectionAddress", element: <SendCollectibles /> },
      { path: "swap", element: <Swap /> },
      { path: "confirm", element: <ConfirmTxFromInternal /> },

      /* settings */
      {
        path: "settings/*",
        children: [
          { index: true, element: <Settings /> },
          {
            path: "contacts/*",
            children: [
              { index: true, element: <Contacts /> },
              { path: "new", element: <AddContact /> },
              { path: "edit/:id", element: <EditContact /> },
            ],
          },
          { path: "permission", element: <ConnectedSites /> },
          { path: "password", element: <Password /> },
          { path: "advanced", element: <Advanced /> },
          { path: "about", element: <About /> },
        ],
      },
    ],
  },
]

export default routes
