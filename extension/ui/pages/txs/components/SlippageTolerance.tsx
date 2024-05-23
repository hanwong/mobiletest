import { useState } from "react"
import { useFormContext } from "react-hook-form"
import type { MantineTheme } from "@mantine/core"
import {
  Container,
  Drawer,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
  keyframes,
  useMantineTheme,
} from "@mantine/core"
import { useDisclosure, useFocusWithin } from "@mantine/hooks"
import { DEFAULT_SLIPPAGE_PERCENT, validateSlippage } from "@initia/utils"
import Icon from "../../../styles/Icon"

const defaultValue = String(DEFAULT_SLIPPAGE_PERCENT)
const SHAKE_DURATION_MS = 300

const SlippageTolerance = () => {
  const theme = useMantineTheme()

  /* form context */
  const { setValue, watch } = useFormContext()
  const value = watch("slippage")

  /* custom field: user input */
  const [opened, { open, close }] = useDisclosure()
  const { focused, ref } = useFocusWithin()
  const [input, setInput] = useState(value)
  const { type, message } = validateSlippage(input)
  const [shake, setShake] = useState(false)

  const setSlippage = () => {
    // User input must be validated to reflect it in the actual data

    if (type === "error") {
      setShake(true)
      setTimeout(() => setShake(false), SHAKE_DURATION_MS)
      return
    }

    setValue("slippage", input)
    close()
  }

  return (
    <>
      <Group position="center" mt={28}>
        <UnstyledButton fz={14} fw={700} onClick={open}>
          <Group spacing={0}>
            <Text>Slippage {value}%</Text>
            <Icon.ChevronDown />
          </Group>
        </UnstyledButton>
      </Group>

      <Drawer title="Slippage tolerance" opened={opened} onClose={setSlippage} size="auto">
        <Container>
          <Stack spacing={2} m={20} pb={20}>
            <Group spacing={8} grow>
              <UnstyledButton
                onClick={() => setInput(defaultValue)}
                sx={getWrapperSx(value === defaultValue || type === "error")}
              >
                Auto
              </UnstyledButton>

              <Flex align="center" sx={getButtonSx({ focused, type, shake })}>
                <TextInput value={input} onChange={(e) => setInput(e.target.value)} styles={inputStyles} ref={ref} />
                <Text sx={{ flex: "none" }}>%</Text>
              </Flex>
            </Group>

            <Text c={type === "error" ? "danger" : "warning"} fz={12} h={12 * Number(theme.lineHeight)} ta="right">
              {message}
            </Text>
          </Stack>
        </Container>
      </Drawer>
    </>
  )
}

export default SlippageTolerance

/* styles */
function getWrapperSx(isActive: boolean) {
  return function ({ fn }: MantineTheme) {
    return {
      background: isActive ? fn.themeColor("mono.0") : undefined,
      border: `1px solid ${isActive ? fn.themeColor("mono.0") : fn.themeColor("mono.4")}`,
      borderRadius: 8,
      color: isActive ? fn.themeColor("mono.8") : fn.themeColor("mono.0"),
      fontSize: 14,
      fontWeight: 500,
      height: 48,
      padding: "0 20px",
      textAlign: "center" as const,

      "&:hover": {
        borderColor: fn.themeColor("mono.0"),
      },
    }
  }
}

const bounce = keyframes({
  "0%": { transform: "translate3d(0, 0, 0)" },
  "10%, 90%": { transform: "translate3d(-10px, 0, 0)" },
  "30%, 70%": { transform: "translate3d(10px, 0, 0)" },
  "50%": { transform: "translate3d(0, 0, 0)" },
})

function getButtonSx({
  focused,
  type,
  shake,
}: {
  focused: boolean
  type: "error" | "warning" | "success"
  shake: boolean
}) {
  return function ({ fn, other }: MantineTheme) {
    const borderColor = {
      success: undefined,
      error: other.danger,
      warning: other.warning,
    }[type]

    return {
      animation: shake ? `${bounce} ${SHAKE_DURATION_MS}ms` : undefined,
      border: `1px solid ${borderColor || (focused ? fn.themeColor("mono.0") : fn.themeColor("mono.4"))}`,
      background: fn.themeColor("mono.6"),
      borderRadius: 8,
      height: 48,
      padding: "0 20px",
    }
  }
}

function inputStyles(_: MantineTheme) {
  return {
    root: { flex: 1 },
    input: { textAlign: "right" as const },
  }
}
