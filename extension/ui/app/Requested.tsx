import type { PropsWithChildren } from "react"
import {
  useRequestedLayer,
  useRequestedPermission,
  useRequestedSignDoc,
  useRequestedTx,
  useRequestedArbitrary,
} from "../background"
import ConfirmPermissionExternal from "../pages/confirm/ConfirmPermission"
import ConfirmAddLayer from "../pages/confirm/ConfirmAddLayer"
import ConfirmSignDoc from "../pages/confirm/ConfirmSignDoc"
import ConfirmTxFromExternal from "../pages/confirm/ConfirmTxFromExternal"
import ConfirmArbitrary from "../pages/confirm/ConfirmArbitrary"

const Requested = ({ children }: PropsWithChildren) => {
  const requestedPermission = useRequestedPermission()
  const requestedLayer = useRequestedLayer()
  const requestedSignDoc = useRequestedSignDoc()
  const requestedTx = useRequestedTx()
  const requestedArbitrary = useRequestedArbitrary()

  if (requestedPermission) return <ConfirmPermissionExternal />
  if (requestedLayer) return <ConfirmAddLayer />
  if (requestedSignDoc) return <ConfirmSignDoc />
  if (requestedTx) return <ConfirmTxFromExternal />
  if (requestedArbitrary) return <ConfirmArbitrary />

  return <>{children}</>
}

export default Requested
