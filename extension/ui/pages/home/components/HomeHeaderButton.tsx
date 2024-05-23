import type { PropsWithChildren } from "react"
import type { LinkProps } from "react-router-dom"
import { Link, useLocation } from "react-router-dom"
import type { MantineTheme } from "@mantine/core"
import { Flex, Group, Text, UnstyledButton, useMantineTheme } from "@mantine/core"
import Icon from "../../../styles/Icon"
import { useIsHome, useHeight } from "../useHomeHeader"

interface Props extends LinkProps {
  first?: boolean
  last?: boolean
}

const HomeHeaderButton = ({ first, last, to, children }: PropsWithChildren<Props>) => {
  const { fn } = useMantineTheme()
  const { pathname } = useLocation()
  const isHome = useIsHome()
  const height = useHeight()
  const isActive = !first && pathname === to
  const borderColor = "mono.7"

  const styles = ({ fn }: MantineTheme) => ({
    background: isActive ? fn.themeColor(borderColor) : undefined,
    borderLeft: !first ? `1px solid ${fn.themeColor(borderColor)}` : undefined,
    color: fn.themeColor(isHome ? "mono.2" : "mono.5"),
    display: "flex",
    flex: first || last ? "none" : isHome ? 1 : undefined,
    fontSize: isHome ? 14 : 11,
    fontWeight: 600,
    height,
    paddingLeft: first ? 12 : 10,
    paddingRight: last ? 12 : 8,

    ...fn.hover({
      background: isActive ? fn.themeColor(borderColor) : fn.themeColor("mono.8"),
    }),
  })

  const hideExpandIcon = !isHome || first || last

  const content = (
    <Group spacing={2} position="apart" sx={{ flex: 1 }}>
      {children}

      {!hideExpandIcon &&
        (isActive ? (
          <Flex>
            <Icon.ChevronUp fill={fn.themeColor("mono.0")} />
          </Flex>
        ) : (
          <Flex>
            <Icon.ChevronDown fill={fn.themeColor("mono.5")} />
          </Flex>
        ))}
    </Group>
  )

  if (isHome) {
    return (
      <UnstyledButton component={Link} to={!isHome || isActive ? "/" : to} sx={styles}>
        {content}
      </UnstyledButton>
    )
  }

  if (first) {
    return (
      <UnstyledButton component={Link} to={!isHome || isActive ? "/" : to} sx={styles}>
        {content}
      </UnstyledButton>
    )
  }

  return <Text sx={styles}>{content}</Text>
}

export default HomeHeaderButton
