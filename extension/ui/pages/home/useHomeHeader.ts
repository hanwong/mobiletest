import { useLocation } from "react-router-dom"

export function useIsHome() {
  const { pathname } = useLocation()
  return ["/", "/chains", "/accounts", "/settings"].includes(pathname)
}

export function useHeight() {
  const isHome = useIsHome()
  return isHome ? 42 : 36
}
