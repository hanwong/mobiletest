import { AppShell, Container, Group, Tabs } from "@mantine/core"
import { useAddress } from "@initia/react-wallet-widget"
import Connection from "./Connection"
import Post from "./Post"
import Arbitrary from "./Arbitrary"

const App = () => {
  const address = useAddress()

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container h="100%">
          <Group justify="flex-end" h="100%">
            <Connection />
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container>
          {address && (
            <Tabs defaultValue="Post">
              <Tabs.List>
                <Tabs.Tab value="Post">Post</Tabs.Tab>
                <Tabs.Tab value="Arbitrary">Arbitrary</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="Post" pt="md">
                <Post />
              </Tabs.Panel>

              <Tabs.Panel value="Arbitrary" pt="md">
                <Arbitrary />
              </Tabs.Panel>
            </Tabs>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
