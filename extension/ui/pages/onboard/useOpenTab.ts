import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { openTab } from "../../../scripts/utils/tab"

export default function useOpenTab() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (import.meta.env.INITIA_ENV === "web") return
    openTab(pathname)
  }, [pathname])
}
