import type { MantineTheme } from "@mantine/core"
import { Group, Text, UnstyledButton } from "@mantine/core"
import { openTab } from "../../../scripts/utils/tab"
import { request } from "../../background"
import Icon from "../../styles/Icon"

const buttons = [
  { label: "Expand", icon: <Icon.ExternalLink width={14} height={14} />, onClick: () => openTab() },
  { label: "Lock", icon: <Icon.Lock width={14} height={14} />, onClick: () => request("lock") },
]

const AppActions = () => {
  return (
    <Group spacing={12} position="right" px={24} py={28}>
      {buttons.map(({ label, icon, onClick }) => (
        <UnstyledButton onClick={onClick} sx={sx} key={label}>
          <Group spacing={4}>
            {icon}
            <Text>{label}</Text>
          </Group>
        </UnstyledButton>
      ))}
    </Group>
  )
}

export default AppActions

/* styles */
function sx({ fn }: MantineTheme) {
  return {
    color: fn.themeColor("mono.3"),
    fontSize: 12,
    fontWeight: 600,

    "&:hover": { color: fn.themeColor("mono.0") },
  }
}
