import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import CheckSharpIcon from "@mui/icons-material/CheckSharp"
import { Box, Center, CopyButton, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core"
import { createInitiaUsernamesClient, isUsernameValid } from "@initia/utils"
import type { Account } from "../../../scripts/types"
import { defaultChain } from "../../../scripts/shared/chains"
import { request, useLayers } from "../../background"
import toast from "../../styles/toast"
import Icon from "../../styles/Icon"
import ExplorerLink from "../../components/ExplorerLink"
import QRCode from "../../components/QRCode"

const AccountDetails = (account: Account) => {
  const { initiaAddress } = account

  const navigate = useNavigate()
  const layers = useLayers()
  const l1 = layers.find((layer) => layer.metadata?.is_l1)

  const { name } = account
  const address = initiaAddress

  const defaultValues = { name }
  const { register, handleSubmit } = useForm<{ name: string }>({ defaultValues })

  const queryClient = useQueryClient()
  const submit = handleSubmit(async ({ name }) => {
    try {
      if (isUsernameValid(name)) {
        if (!defaultChain.modules.usernames) throw new Error("Usernames not supported")
        const usernames = createInitiaUsernamesClient(defaultChain.rest, defaultChain.modules.usernames)
        const username = await usernames.getUsername(initiaAddress)
        if (name !== username) throw new Error("Not your username")
      }

      await request("changeAccountName", { address: initiaAddress, name })
      queryClient.refetchQueries()
      // Why?
      // 1. `invalidateQueries()` only refreshes on the next hook
      // 2. `resetQueries()` sets the persistent data on every render
      // Side effect: It blinks
      navigate(0)
      toast.success("Account updated")
    } catch (error) {
      toast.error(String(error))
    }
  })

  const handleDelete = async () => {
    try {
      if (window.prompt(`Type ${name} to confirm`) !== name) throw new Error("Account not deleted")
      await request("deleteAccount", initiaAddress)
      navigate("/")
      await queryClient.invalidateQueries()
    } catch (error) {
      toast.error(String(error))
    }
  }

  return (
    <Box p={20}>
      <form onSubmit={submit}>
        <TextInput {...register("name")} />
      </form>

      <Stack spacing={20} mt={20} mb={40}>
        <Center>
          <QRCode value={address} size={120} />
        </Center>

        <Center>
          <CopyButton value={address}>
            {({ copied, copy }) => (
              <UnstyledButton
                display="inline-flex"
                bg="mono.6"
                c="mono.3"
                fw={600}
                fz={11}
                sx={({ fn }) => ({
                  border: `1px solid ${fn.themeColor("mono.6")}`,
                  borderRadius: 28 / 2,
                  ...fn.hover({ borderColor: fn.themeColor("mono.5") }),
                })}
                onClick={copy}
              >
                <Group spacing={6} h={28} px={12}>
                  <Text>{address}</Text>

                  <Group spacing={2}>
                    {copied ? (
                      <CheckSharpIcon color="inherit" sx={{ fontSize: 12 }} />
                    ) : (
                      <Icon.Copy fill="currentColor" width={12} height={12} />
                    )}
                  </Group>
                </Group>
              </UnstyledButton>
            )}
          </CopyButton>
        </Center>
      </Stack>

      <Group position="center">
        <UnstyledButton
          c="mono.3"
          component={ExplorerLink}
          layer={l1}
          value={address}
          sx={({ fn }) => fn.hover({ color: fn.themeColor("mono.1"), textDecoration: "none" })}
        >
          <Group spacing={4}>
            <Icon.ExternalLink width={14} height={14} />
            <Text fz={12} fw={600}>
              View on Explorer
            </Text>
          </Group>
        </UnstyledButton>

        <UnstyledButton
          c="mono.3"
          component={Link}
          to={`/account/export/private-key/${address}`}
          sx={({ fn }) => fn.hover({ color: fn.themeColor("mono.1"), textDecoration: "none" })}
        >
          <Group spacing={4}>
            <Icon.Import width={14} height={14} />
            <Text fz={12} fw={600}>
              Backup private key
            </Text>
          </Group>
        </UnstyledButton>

        <UnstyledButton
          c="mono.3"
          onClick={handleDelete}
          sx={({ fn }) => fn.hover({ color: fn.themeColor("mono.1"), textDecoration: "none" })}
        >
          <Group c="danger" spacing={4}>
            <Icon.Trash width={14} height={14} />
            <Text fz={12} fw={600}>
              Delete account
            </Text>
          </Group>
        </UnstyledButton>
      </Group>
    </Box>
  )
}

export default AccountDetails
