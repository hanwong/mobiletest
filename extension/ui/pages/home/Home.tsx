import { ErrorBoundary } from "@initia/react-components"
import { useAccounts, useInitLayers, useInitialized } from "../../background"
import Onboard from "../onboard/Onboard"
import HomeInitia from "./HomeInitia"
import HomeHeader from "./components/HomeHeader"

const Home = () => {
  const initialized = useInitialized()
  const accounts = useAccounts()
  useInitLayers()

  if (!initialized || !accounts.length) return <Onboard />

  return (
    <>
      <HomeHeader />
      <ErrorBoundary>
        <HomeInitia />
      </ErrorBoundary>
    </>
  )
}

export default Home
