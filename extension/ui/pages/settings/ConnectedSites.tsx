import { useQueryClient } from "@tanstack/react-query"
import type { MantineTheme } from "@mantine/core"
import { Group, Image, Stack, Text, UnstyledButton } from "@mantine/core"
import { request, useAuthorizedPermission } from "../../background"
import Page from "../../components/Page"

const ConnectedSites = () => {
  const authorized = useAuthorizedPermission()
  const list = Object.values(authorized)

  const queryClient = useQueryClient()
  const disconnect = async (url: string) => {
    await request("deleteAuthorizedPermission", url)
    await queryClient.invalidateQueries()
  }

  const renderItem = ({ favicon, url }: { favicon?: string; url: string }, hideDeleteButton?: boolean) => {
    return (
      <Group position="apart" bg="mono.7" p={20} sx={{ borderRadius: 20 }} key={url}>
        <Group spacing={8}>
          <Image src={favicon} width={24} height={24} />
          <Text fz={14} fw={500}>
            {url}
          </Text>
        </Group>

        {!hideDeleteButton && (
          <UnstyledButton sx={deleteButtonSx} onClick={() => window.confirm(`Delete ${url}?`) && disconnect(url)}>
            Delete
          </UnstyledButton>
        )}
      </Group>
    )
  }

  return (
    <Page title="Connected Sites">
      <Text c="mono.3" fz={14} fw={600} mb={32}>
        List of sites that can view the address of the accounts.
      </Text>

      <Stack spacing={8}>
        {renderItem({ favicon: "https://assets.initia.xyz/images/chains/Initia.webp", url: "*.initia.xyz" }, true)}
        {list.map((item) => renderItem(item))}
      </Stack>
    </Page>
  )
}

export default ConnectedSites

/* styles */
function deleteButtonSx({ fn }: MantineTheme) {
  return {
    borderRadius: 6,
    color: fn.themeColor("mono.0"),
    fontSize: 12,
    fontWeight: 600,
    height: 30,
    padding: 20,
    paddingTop: 0,
    paddingBottom: 0,

    "&:hover": {
      backgroundColor: fn.themeColor("mono.8"),
    },
  }
}
