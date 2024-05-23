import { forwardRef, type ReactNode } from "react"
import type { UnstyledButtonProps } from "@mantine/core"
import { Button, createPolymorphicComponent, Group, Stack, Text } from "@mantine/core"
import { truncate } from "@initia/utils"
import type { Contact } from "./useContacts"

interface Props extends UnstyledButtonProps, Partial<Contact> {
  rightSection?: ReactNode
}

const _ContactItem = forwardRef<HTMLButtonElement, Props>(
  ({ name, address = "", memo, rightSection, sx, ...others }, ref) => {
    const title = name || truncate(address)
    const subtitle = name ? truncate(address) : undefined

    return (
      <Button variant="item" rightIcon={rightSection} {...others} ref={ref}>
        <Stack spacing={4}>
          <Text>{title}</Text>

          <Text c="mono.4" fz={12} fw={600}>
            <Group spacing={8}>
              <Text inherit>{subtitle}</Text>
              {memo && <Text inherit>{memo}</Text>}
            </Group>
          </Text>
        </Stack>
      </Button>
    )
  },
)

const ContactItem = createPolymorphicComponent<"div", Props>(_ContactItem)

export default ContactItem
