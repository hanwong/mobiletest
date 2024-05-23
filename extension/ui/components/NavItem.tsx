import type { ReactNode } from "react"
import type { MantineTheme } from "@mantine/core"
import { createPolymorphicComponent, Flex, Group, UnstyledButton } from "@mantine/core"
import Icon from "../styles/Icon"

interface Props {
  icon?: ReactNode
  label: string
}

const _NavItem = ({ icon, label, ...other }: Props) => {
  return (
    <UnstyledButton sx={sx} {...other}>
      <Group position="apart">
        <Group spacing={8}>
          {icon}
          {label}
        </Group>

        <Flex c="mono.3">
          <Icon.ChevronRight />
        </Flex>
      </Group>
    </UnstyledButton>
  )
}

const NavItem = createPolymorphicComponent<"button", Props>(_NavItem)

export default NavItem

/* styles */
function sx({ fn }: MantineTheme) {
  return {
    color: fn.themeColor("mono.1"),
    display: "block",
    fontSize: 16,
    fontWeight: 600,
    padding: 20,
    paddingTop: 18,
    paddingBottom: 18,
    width: "100%",

    "&:hover": {
      color: fn.themeColor("mono.0"),
      textDecoration: "none",
    },
  }
}
