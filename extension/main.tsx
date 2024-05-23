import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { RecoilRoot } from "recoil"
import { createHashRouter, RouterProvider } from "react-router-dom"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { Global, MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals"
import { queryClient, persister, dehydrateOptions, buster } from "./ui/queryClient"
import theme from "./ui/styles/theme"
import fonts from "./ui/styles/fonts"
import routes from "./ui/routes"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Suspense>
      <RecoilRoot>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, dehydrateOptions, buster }}>
          <MantineProvider withNormalizeCSS withGlobalStyles theme={theme}>
            <ModalsProvider>
              <Global styles={fonts} />
              <RouterProvider router={createHashRouter(routes)} />
              <Notifications position="bottom-center" />
            </ModalsProvider>
          </MantineProvider>
        </PersistQueryClientProvider>
      </RecoilRoot>
    </Suspense>
  </StrictMode>,
)
