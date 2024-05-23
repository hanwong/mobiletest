import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import {
  ActionIcon,
  Box,
  Center,
  Container,
  CopyButton,
  Drawer,
  Flex,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { truncate } from "@initia/utils"
import type { Account } from "../../../../scripts/types"
import { request, useAccounts, useAddress } from "../../../background"
import Icon from "../../../styles/Icon"
import capitalize from "../../../components/capitalize"
import AccountDetails from "../../settings/AccountDetails"
import HomeHeader from "../components/HomeHeader"
import FullHeight from "../components/FullHeight"

const AccountItem = (account: Account) => {
  const { initiaAddress, name } = account
  const [opened, { open, close }] = useDisclosure()

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const connected = useAddress()

  const getTag = (account: Account) => {
    switch (account.type) {
      case "privateKey":
        return account.payload?.provider ?? ""

      default:
        return ""
    }
  }

  const address = initiaAddress
  const tag = capitalize(getTag(account))
  const isActive = connected === address

  const handleClick = async () => {
    if (isActive) return
    navigate("/")
    await request("setAccount", initiaAddress)
    await queryClient.invalidateQueries()
  }

  return (
    <>
      <Box
        px={20}
        py={16}
        sx={({ fn }) => ({
          background: fn.themeColor("mono.6"),
          border: `1px solid ${fn.themeColor(isActive ? "mono.2" : "mono.6")}`,
          borderRadius: 20,
          cursor: "pointer",
          ...fn.hover({
            borderColor: fn.themeColor(isActive ? "mono.2" : "mono.5"),
          }),
        })}
        onClick={handleClick}
        key={address}
      >
        <Group position="apart">
          <Stack spacing={4} miw={1} sx={{ flex: 1 }}>
            <Text c="mono.1" fz={14} fw={600} truncate>
              {name}
            </Text>

            <Text c="mono.4" fz={12} fw={600}>
              {truncate(address)}
            </Text>
          </Stack>

          <Group spacing={0} sx={{ flex: "none" }}>
            {tag && (
              <Text bg="mono.4" c="mono.0" fz={10} fw={700} py={2} px={8} sx={{ borderRadius: 2 }}>
                {tag}
              </Text>
            )}

            <CopyButton value={address}>
              {({ copied, copy }) => (
                <Group spacing={2} fz={12}>
                  <Text tt="uppercase">{copied ? "Copied" : ""}</Text>
                  <UnstyledButton
                    onClick={(e) => {
                      e.stopPropagation()
                      copy()
                    }}
                    sx={({ fn }) => ({
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      ...fn.hover({ background: fn.themeColor("mono.8") }),
                    })}
                  >
                    <Flex align="center" justify="center">
                      <Icon.Copy width={12} height={12} />
                    </Flex>
                  </UnstyledButton>
                </Group>
              )}
            </CopyButton>

            <ActionIcon
              onClick={open}
              size="sm"
              sx={({ fn }) => ({ borderRadius: 4, "&:hover": { background: fn.themeColor("mono.6") } })}
            >
              <Icon.MoreVert width={14} height={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      <Drawer opened={opened} onClose={close}>
        <Container>
          <AccountDetails {...account} />
        </Container>
      </Drawer>
    </>
  )
}

const Accounts = () => {
  const accounts = useAccounts()

  return (
    <FullHeight
      footer={
        <Center my={24}>
          <UnstyledButton
            component={Link}
            to="/onboard"
            display="flex"
            c="mono.3"
            h={32}
            px={20}
            sx={({ fn }) => ({
              border: `1px solid ${fn.themeColor("mono.5")}`,
              borderRadius: 32 / 2,

              ...fn.hover({
                borderColor: fn.themeColor("mono.2"),
                color: fn.themeColor("mono.0"),
              }),
            })}
          >
            <Group spacing={2}>
              <Icon.Plus width={14} height={14} />
              <Text fz={12} fw={600}>
                Add a new account
              </Text>
            </Group>
          </UnstyledButton>
        </Center>
      }
    >
      <HomeHeader />

      <Box px={20}>
        <Text mt={52} mb={28}>
          Select an account to manage
          <br />
          assets on another wallet.
        </Text>

        <Stack spacing={8}>
          {accounts.map((account) => (
            <AccountItem {...account} key={account.initiaAddress} />
          ))}
        </Stack>
      </Box>
    </FullHeight>
  )
}

export default Accounts
