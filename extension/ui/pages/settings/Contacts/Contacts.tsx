import { Link } from "react-router-dom"
import { Button, Center, Group, Stack, Text } from "@mantine/core"
import Icon from "../../../styles/Icon"
import Page from "../../../components/Page"
import FixedBottom from "../../../components/FixedBottom"
import useContacts from "./useContacts"
import ContactItem from "./ContactItem"

const Contacts = () => {
  const { contacts } = useContacts()

  return (
    <Page title="Contacts">
      {!contacts.length ? (
        <Stack spacing={12} mt={28} ta="center">
          <Stack spacing={4} c="mono.2">
            <Center>
              <Icon.Contact width={40} height={40} />
            </Center>

            <Text fz={12}>No contacts yet</Text>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={8}>
          {contacts.map(({ id, ...contact }) => (
            <ContactItem {...contact} component={Link} to={`./edit/${id}`} key={id} />
          ))}
        </Stack>
      )}

      <FixedBottom>
        <Button
          variant="secondary"
          component={Link}
          to="./new"
          p={4}
          sx={({ fn }) => ({ color: fn.themeColor("mono.0") })}
        >
          <Group spacing={6}>
            <Icon.Plus width={14} height={14} />
            <Text fz={12} fw={600}>
              Add a new contact
            </Text>
          </Group>
        </Button>
      </FixedBottom>
    </Page>
  )
}

export default Contacts
