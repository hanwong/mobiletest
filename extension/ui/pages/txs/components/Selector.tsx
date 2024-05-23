import type { ReactNode } from "react"
import { Fragment, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useDisclosure } from "@mantine/hooks"
import type { MantineTheme } from "@mantine/core"
import { Box, Button, Container, Drawer, Group, Stack, Text, UnstyledButton } from "@mantine/core"
import ExtendedMap from "../helpers/ExtendedMap"

interface Props<T> {
  name: string
  label: string
  data: Map<string, T>
  toOptionItem: (item: T) => OptionItem
  renderSelectedItem: (item?: T) => ReactNode
  readOnly?: boolean
  compact?: boolean
}

interface OptionItem {
  title: string
  description?: string
  imageSection: ReactNode
  rightSection?: ReactNode
  disabled?: boolean
}

function Selector<T>({ name, label, data, toOptionItem, renderSelectedItem, readOnly, compact }: Props<T>) {
  const [opened, { open, close }] = useDisclosure(false)

  /* form context */
  const { register, watch } = useFormContext()
  const value = watch(name)
  const options = new ExtendedMap(data).map((key, value) => [key, toOptionItem(value)]).toMap()
  const selectedItem = data.get(value)

  useEffect(() => {
    close() // close drawer when value changes
  }, [close, value])

  return (
    <>
      {readOnly ? (
        <Text>{renderSelectedItem(selectedItem)}</Text>
      ) : (
        <UnstyledButton sx={!compact ? buttonSx : undefined} onClick={open}>
          {renderSelectedItem(selectedItem)}
        </UnstyledButton>
      )}

      <Drawer title={label} opened={opened} onClose={close}>
        <Container>
          <Stack spacing={8} px={20}>
            {[...options].map(([key, { title, description, imageSection, rightSection, disabled }]) => (
              <Fragment key={key}>
                <Button
                  variant="item"
                  component="label"
                  htmlFor={key}
                  data-active={key === value || undefined}
                  key={key}
                >
                  <Group position="apart" sx={{ flex: 1 }}>
                    <Group spacing={10}>
                      {imageSection}

                      <Box>
                        <Text>{title}</Text>

                        {description && (
                          <Text c="mono.4" fz={10} fw={700}>
                            {description}
                          </Text>
                        )}
                      </Box>
                    </Group>

                    {rightSection}
                  </Group>
                </Button>

                <input type="radio" id={key} value={key} {...register(name)} disabled={disabled} hidden />
              </Fragment>
            ))}
          </Stack>
        </Container>
      </Drawer>
    </>
  )
}

export default Selector

/* styles */
function buttonSx({ fn }: MantineTheme) {
  return {
    border: "1px solid transparent",
    borderRadius: 36 / 2,
    height: 36,
    paddingLeft: 8,
    paddingRight: 8,
    margin: -8,
    ...fn.hover({ borderColor: fn.themeColor("mono.5") }),
  }
}
