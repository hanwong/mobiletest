import { Accordion, Stack, Text } from "@mantine/core"
import { truncate } from "@initia/utils"

interface Message {
  title: string
  description?: string
  details: { title: string; content: string }[]
}

const ConfirmTxMessages = ({ messages }: { messages: Message[] }) => {
  return (
    <Accordion>
      {messages.map(({ title, description, details }, index) => (
        <Accordion.Item value={String(index)} key={index}>
          <Accordion.Control>
            {title}
            {description && ` (${truncate(description)})`}
          </Accordion.Control>

          <Accordion.Panel p={20}>
            <Stack spacing={20}>
              {details.map(({ title, content }) => {
                if (!content) return null
                return (
                  <Stack spacing={4} key={title}>
                    <Text>{title}</Text>
                    <Text c="mono.2">{content}</Text>
                  </Stack>
                )
              })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

export default ConfirmTxMessages
