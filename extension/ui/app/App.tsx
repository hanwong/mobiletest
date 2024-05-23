import { Outlet, useLocation } from "react-router-dom"
import { Container, Global } from "@mantine/core"
import { ErrorBoundary } from "@initia/react-components"
import { EXTENSION_WIDTH } from "../../scripts/shared/constants"
import { useInitialized, useIsPopup, useLocked, useSubscribe } from "../background"
import ScrollToTop from "../components/ScrollToTop"
import Requested from "./Requested"
import Unlocked from "./Unlocked"
import Debug from "./Debug"
import News from "./News"
import UsernameFound from "./UsernameFound"
import ChainId from "./ChainId"

const App = () => {
  const { key } = useLocation()

  useSubscribe()

  const initialized = useInitialized()
  const locked = useLocked()
  const isPopup = useIsPopup()

  // PersistQueryClientProvider does not handle suspense.
  // Block the rendering until the status is confirmed.
  if (typeof initialized !== "boolean") return null
  if (typeof locked !== "boolean") return null

  return (
    <>
      {isPopup && <Global styles={{ body: { width: EXTENSION_WIDTH } }} />}
      <ScrollToTop />

      <Container>
        <Unlocked>
          <Requested>
            <ErrorBoundary key={key}>
              <ChainId />
              <Outlet />
            </ErrorBoundary>

            <ErrorBoundary fallback={() => null}>
              <News />
              <UsernameFound />
            </ErrorBoundary>
          </Requested>
        </Unlocked>
      </Container>

      {import.meta.env.INITIA_ENV === "web" && (
        <ErrorBoundary fallback={() => null}>
          <Debug />
        </ErrorBoundary>
      )}
    </>
  )
}

export default App
