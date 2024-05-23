import type { PropsWithChildren } from "react"
import { useLocked, useInitialized } from "../background"
import Unlock from "./Unlock"

const Unlocked = ({ children }: PropsWithChildren) => {
  const initialized = useInitialized()
  const locked = useLocked()
  if (initialized && locked) return <Unlock />
  return <>{children}</>
}

export default Unlocked
