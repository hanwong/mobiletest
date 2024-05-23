import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Box } from "@mantine/core"
import { useAccounts } from "../../../background"
import Icon from "../../../styles/Icon"
import NavList from "../../../components/NavList"
import NavItem from "../../../components/NavItem"
import AppActions from "../../settings/AppActions"
import HomeHeader from "../components/HomeHeader"
import FullHeight from "../components/FullHeight"

const settings = [
  { to: "./contacts", label: "Contacts", icon: <Icon.Contact /> },
  { to: "./permission", label: "Connected Sites", icon: <Icon.Link /> },
  { to: "./password", label: "Change Password", icon: <Icon.Lock /> },
  { to: "./advanced", label: "Advanced", icon: <Icon.Adjust /> },
  { to: "./about", label: "About", icon: <Icon.Info /> },
]

const Settings = () => {
  const navigate = useNavigate()
  const accounts = useAccounts()
  const hasAccounts = accounts.length > 0

  useEffect(() => {
    if (!hasAccounts) navigate("/")
  }, [hasAccounts, navigate])

  return (
    <FullHeight footer={<AppActions />}>
      <HomeHeader />

      <Box px={20} my={28}>
        <NavList>
          {settings.map((item) => (
            <NavItem component={Link} {...item} key={item.to} />
          ))}
        </NavList>
      </Box>
    </FullHeight>
  )
}

export default Settings
