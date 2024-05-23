import { useState } from "react"
import { atom, useRecoilState } from "recoil"
import { Link } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Center, Group, Text, UnstyledButton } from "@mantine/core"
import { useTimeout } from "@mantine/hooks"
import Icon from "../../styles/Icon"
import AssetsInitia from "../assets/AssetsInitia"
import Collectibles from "../collectibles/Collectibles"
import Activity from "../activity/Activity"
import DashedButton from "./components/DashedButton"
import HomeInitiaTabs from "./HomeInitiaTabs"

const homeTabState = atom({
  key: "homeTabState",
  default: "",
})

const HomeInitia = () => {
  const [homeTab, setHomeTab] = useRecoilState(homeTabState)

  const renderByTab = () => {
    switch (homeTab) {
      case "":
        return (
          <>
            <AssetsInitia />
            {manageLayersButton}
            {refreshButton}
          </>
        )

      case "NFT":
        return (
          <>
            <Collectibles />
            {manageLayersButton}
            {refreshButton}
          </>
        )

      case "Activity":
        return <Activity />
    }
  }

  const queryClient = useQueryClient()
  const [disabled, setDisabled] = useState(false)
  const { start } = useTimeout(() => setDisabled(false), 3000)
  const refresh = async () => {
    setDisabled(true)
    await queryClient.invalidateQueries()
    start()
  }

  const refreshButton = (
    <Center>
      <UnstyledButton c="mono.5" py={8} mb={8} onClick={refresh} disabled={disabled}>
        <Group spacing={2} sx={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "wait" : "pointer" }}>
          <Icon.Refresh width={10} height={10} />
          <Text fz={12} fw={600}>
            Refresh
          </Text>
        </Group>
      </UnstyledButton>
    </Center>
  )

  const manageLayersButton = (
    <DashedButton mx={20} component={Link} to="/layers">
      <Group spacing={6}>
        <Icon.Settings width={10} height={10} />
        <Text>Manage my Minitias</Text>
      </Group>
    </DashedButton>
  )

  return (
    <>
      <Center bg="mono.9" pos="sticky" top={0} sx={{ zIndex: 1020 }} pt={28} mb={34}>
        <HomeInitiaTabs currentTab={homeTab} onSelect={setHomeTab} />
      </Center>

      {renderByTab()}
    </>
  )
}

export default HomeInitia
