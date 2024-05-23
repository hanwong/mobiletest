import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WalletWidgetProvider } from "@initia/react-wallet-widget"
import { createHTTPClient } from "@initia/utils"
import "@mantine/core/styles.css"
import "@mantine/code-highlight/styles.css"
import App from "./src/App"

const queryClient = new QueryClient()
const layer = await createHTTPClient("https://omni-api.initiation-1.initia.xyz").get("/v1/registry/chains/layer1")

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <WalletWidgetProvider layer={layer}>
      <MantineProvider defaultColorScheme="dark">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MantineProvider>
    </WalletWidgetProvider>
  </StrictMode>,
)
