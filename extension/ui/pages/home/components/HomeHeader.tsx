import { useLocation } from "react-router-dom"
import { CopyButton, Flex, Group, Image, Text, Tooltip, UnstyledButton } from "@mantine/core"
import { truncate } from "@initia/utils"
import { defaultChain } from "../../../../scripts/shared/chains"
import { useAccountName, useAddress } from "../../../background"
import Icon from "../../../styles/Icon"
import { useSearchParam } from "../../txs/helpers/param"
import HomeHeaderButton from "./HomeHeaderButton"
import { useIsHome } from "../useHomeHeader"

const HomeHeader = () => {
  const isHome = useIsHome()
  const { pathname } = useLocation()
  const chain = defaultChain
  const accountName = useAccountName()
  const chainId = useSearchParam("layer")
  const address = useAddress()
  const borderColor = "mono.7"

  return (
    <Flex
      justify="space-between"
      bg="mono.9"
      sx={({ fn }) => ({ borderBottom: `1px solid ${fn.themeColor(borderColor)}` })}
    >
      <Flex sx={{ flex: 1 }}>
        <HomeHeaderButton to="/" first>
          <Image src={chain.logo} width={18} height={18} />
        </HomeHeaderButton>

        <HomeHeaderButton to="/accounts">
          <Group spacing={2}>
            <Text fz={12} fw={600}>
              {accountName}
            </Text>

            <CopyButton value={address}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "COPIED" : truncate(address)} position="right">
                  <UnstyledButton
                    c="mono.5"
                    p={4}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      copy()
                    }}
                    sx={({ fn }) => ({ ...fn.hover({ color: fn.themeColor("mono.0") }) })}
                  >
                    <Flex align="center" justify="center">
                      <Icon.Copy width={12} height={12} />
                    </Flex>
                  </UnstyledButton>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </HomeHeaderButton>

        {!isHome && chainId && <HomeHeaderButton to="">{chainId}</HomeHeaderButton>}
      </Flex>

      {isHome && (
        <HomeHeaderButton to="/settings" last>
          <Flex c={pathname === "/settings" ? "mono.0" : "mono.4"}>
            <Icon.List width={16} height={16} />
          </Flex>
        </HomeHeaderButton>
      )}
    </Flex>
  )
}

export default HomeHeader
