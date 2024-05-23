import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Container, Drawer, Group, Stack, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { useUsernameFromAddress } from "../data/name"
import { request, useAccount, useAddress } from "../background"
import toast from "../styles/toast"

const UsernameFound = () => {
  const navigate = useNavigate()
  const [ignore, setIgnore] = useLocalStorage<string[]>({
    key: "IgnoreUsername",
    defaultValue: [],
    getInitialValueInEffect: false,
  })

  const address = useAddress()
  const { data: username } = useUsernameFromAddress(address)
  const account = useAccount()
  const queryClient = useQueryClient()

  if (!account) return null
  const { initiaAddress, name } = account

  const approve = async () => {
    try {
      if (!username) return
      await request("changeAccountName", { address: initiaAddress, name: username })
      await queryClient.invalidateQueries()
      // Why?
      // 1. `invalidateQueries()` only refreshes on the next hook
      // 2. `resetQueries()` sets the persistent data on every render
      // Side effect: It blinks
      navigate(0)
      toast.success("Account updated")
    } catch (error) {
      toast.error(String(error))
    }
  }

  const reject = () => {
    setIgnore([...ignore, initiaAddress])
  }

  if (!username) return null
  if (username === name) return null
  if (ignore.includes(initiaAddress)) return null

  return (
    <Drawer title="Username found" opened onClose={reject} size="auto">
      <Container>
        <Stack p={20} pt={0}>
          <Text c="mono.0">
            Found the username{" "}
            <Text fw={700} span>
              {username}
            </Text>{" "}
            set by this account. Would you like to rename your account with this? (Recommended)
          </Text>

          <Group grow>
            <Button variant="secondary" onClick={reject}>
              Reject
            </Button>
            <Button onClick={approve}>Approve</Button>
          </Group>
        </Stack>
      </Container>
    </Drawer>
  )
}

export default UsernameFound
