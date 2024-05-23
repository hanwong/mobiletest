import type { ReactNode } from "react"
import { Group, Stack, Text } from "@mantine/core"

interface Content {
  title: string
  content: ReactNode
}

const Details = ({ contents }: { contents: Content[] }) => {
  const renderDetail = ({ title, content }: Content) => {
    if (!content) return null
    return (
      <Group fz={12} position="apart" key={title}>
        <Text c="mono.2" inherit>
          {title}
        </Text>

        <Text inherit>{content}</Text>
      </Group>
    )
  }

  if (contents.every(({ content }) => !content)) return null

  return (
    <Stack sx={{ borderRadius: 8 }} spacing={12} mt={28}>
      {contents.map(renderDetail)}
    </Stack>
  )
}

export default Details
