import { useEffect, useMemo, useState, type PropsWithChildren } from "react"
import type { Config, WalletWidget } from "@initia/wallet-widget"
import context from "./context"

const { Provider } = context

declare global {
  interface Window {
    createWalletWidget?: (config: Config) => WalletWidget
  }
}

function WalletWidgetProvider({ children, ...config }: PropsWithChildren<Config>) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://cdn.jsdelivr.net/npm/@initia/wallet-widget/dist/index.min.js"
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
    }
    document.head.appendChild(script)
  }, [])

  const widget = useMemo(() => {
    if (!isLoaded) return null
    return window.createWalletWidget!(config)
  }, [config, isLoaded])

  if (!widget) return null
  return <Provider value={widget}>{children}</Provider>
}

export default WalletWidgetProvider
