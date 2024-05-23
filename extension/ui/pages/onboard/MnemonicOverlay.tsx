import { useState } from "react"
import type { MantineTheme } from "@mantine/core"
import { Box, CopyButton, Flex, Group, Overlay, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core"
import Icon from "../../styles/Icon"

const MnemonicOverlay = ({ children }: { children: string }) => {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const words = children.split(" ")

  return (
    <Stack spacing={12}>
      <Box pos="relative" bg="mono.7" p={20} sx={{ borderRadius: 8 }}>
        {!visible && (
          <Overlay color="#000" opacity={0} blur={5} zIndex={5} center>
            <UnstyledButton onClick={toggle} sx={buttonSx}>
              <Group spacing={2}>
                <Icon.Show width={14} height={14} />
                <Text>Reveal</Text>
              </Group>
            </UnstyledButton>
          </Overlay>
        )}

        <SimpleGrid cols={3} spacing={10}>
          {words.map((word, index) => (
            <Group fz={12} fw={600} spacing={4} key={index}>
              <Text c="mono.3" w={16} ta="center" sx={{ userSelect: "none" }}>
                {index + 1}.
              </Text>
              <Text c="mono.1">{word}</Text>
            </Group>
          ))}
        </SimpleGrid>
      </Box>

      <Flex justify="flex-end">
        {visible && (
          <CopyButton value={children}>
            {({ copy, copied }) => (
              <UnstyledButton onClick={copy} sx={buttonSx}>
                <Group spacing={2}>
                  {copied ? <Icon.CheckCircle width={14} height={14} /> : <Icon.Copy width={14} height={14} />}

                  <Text>{copied ? "Copied" : "Copy to clipboard"}</Text>
                </Group>
              </UnstyledButton>
            )}
          </CopyButton>
        )}
      </Flex>
    </Stack>
  )
}

export default MnemonicOverlay

/* styles */
function buttonSx({ fn }: MantineTheme) {
  return {
    color: fn.themeColor("mono.0"),
    fontSize: 12,
    fontWeight: 600,
  }
}
