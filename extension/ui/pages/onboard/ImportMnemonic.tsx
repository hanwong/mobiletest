import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFieldArray, useForm } from "react-hook-form"
import { useDisclosure } from "@mantine/hooks"
import type { MantineTheme } from "@mantine/core"
import {
  Box,
  Button,
  Flex,
  Group,
  Input,
  NativeSelect,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core"
import { modals } from "@mantine/modals"
import { BigNumber } from "bignumber.js"
import { mergeDeepRight, prop, range } from "ramda"
import * as bip39 from "bip39"
import { request, useInitialized } from "../../background"
import styles from "../../styles/styles"
import Icon from "../../styles/Icon"
import FixedBottom from "../../components/FixedBottom"
import OnboardPage from "./components/OnboardPage"
import OnboardBackButton from "./components/OnboardBackButton"
import InitializeVault from "./InitializeVault"

const validateMnemonic = {
  length: (value = "") => {
    const length = value.split(" ").length
    return length === 12 || length === 24 || "Mnemonic must be 12 or 24 words"
  },
  wordlist: (value = "") => {
    const words = value.split(" ")
    const wordlist = bip39.wordlists.english
    const invalidWords = words.filter((word) => word && !wordlist.includes(word))
    return invalidWords.length === 0 || `Invalid words: ${invalidWords.join(", ")}`
  },
  bip39: (value = "") => bip39.validateMnemonic(value) || "Invalid mnemonic",
}

const ImportMnemonicForm = () => {
  const navigate = useNavigate()
  const initialized = useInitialized()

  const [length, setLength] = useState(12)

  const defaultValues = { words: Array(12).fill(() => ({ value: "" })), index: 0 }
  const { register, control, handleSubmit, formState } = useForm({ defaultValues })
  const { fields, append, remove } = useFieldArray({ control, name: "words" })

  const handleLengthChange = (value: string) => {
    const length = Number(value)
    if (length === 12) remove(range(12, 24))
    else if (fields.length === 12) append(Array(12).fill(() => ({ value: "" })))
    setLength(length)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData("text")
    const words = value.trim().split(" ")

    if (words.length === 12 || words.length === 24) {
      e.preventDefault()
      remove()
      append(words.map((word) => ({ value: word })))
      setLength(words.length)
    }
  }

  const validate = (mnemonic = "") => {
    const errors = Object.values(validateMnemonic).map((fn) => fn(mnemonic))
    return errors.find((error) => typeof error === "string")
  }

  const submit = handleSubmit(async ({ words, index }) => {
    const mnemonic = words.map(prop("value")).join(" ").trim()
    const errorMessage = validate(mnemonic)
    if (errorMessage) return modals.open({ children: errorMessage })
    await request("createAccount", { mnemonic, index })
    navigate("/")
  })

  const [isAdvancedOpen, { toggle: toggleAdvanced }] = useDisclosure()

  if (!initialized) return <InitializeVault />

  return (
    <OnboardPage title="Import recovery phrase" subtitle="Enter the recovery phrase of the account to add.">
      <form onSubmit={submit}>
        <Stack spacing={20}>
          <Flex justify="flex-end">
            <NativeSelect
              value={String(length)}
              onChange={(e) => handleLengthChange(e.target.value)}
              rightSection={<Icon.ChevronDown width={12} height={12} />}
              styles={selectStyles}
              data={[
                { value: "12", label: "12 words" },
                { value: "24", label: "24 words" },
              ]}
            />
          </Flex>

          <SimpleGrid cols={3} spacing={16} verticalSpacing={8}>
            {fields.map(({ id }, index) => (
              <Group spacing={4} key={id}>
                <Input.Label c="mono.2" fz={12} fw={600} w={16} ta="center">
                  {index + 1}.
                </Input.Label>

                <PasswordInput
                  {...register(`words.${index}.value`)}
                  autoFocus={index === 0}
                  onPaste={handlePaste}
                  sx={{ flex: 1 }}
                  styles={(theme) =>
                    mergeDeepRight(styles.TextInput(theme), {
                      root: {
                        flex: 1,
                        minWidth: 0,
                      },
                      input: {
                        borderRadius: 12,
                        height: 30,
                        marginTop: 0,
                        paddingLeft: 12,
                        paddingRight: 12,
                      },
                      innerInput: {
                        color: theme.fn.themeColor("mono.0"),
                        fontSize: 12,
                        fontWeight: 600,
                        height: 30,
                      },
                    })
                  }
                />
              </Group>
            ))}
          </SimpleGrid>

          <Box>
            <UnstyledButton onClick={toggleAdvanced}>
              <Group spacing={4}>
                <Icon.ChevronDown
                  style={{ transition: "transform 150ms", transform: `rotate(${isAdvancedOpen ? "0" : "-90deg"})` }}
                />
                <Text c="mono.2" fz={14} fw={600}>
                  Advanced
                </Text>
              </Group>
            </UnstyledButton>

            {isAdvancedOpen && (
              <TextInput
                label="Index"
                {...register("index", {
                  required: true,
                  validate: {
                    positive: (value) => BigNumber(value).gte(0) || "Index must be positive",
                    integer: (value) => BigNumber(value).isInteger() || "Index must be an integer",
                    lessThan: (value) => BigNumber(value).lt(2 ** 31) || `Index must be less than ${2 ** 31}`,
                  },
                })}
                error={formState.errors.index?.message}
              />
            )}
          </Box>
        </Stack>

        <FixedBottom>
          <Group grow>
            <OnboardBackButton />
            <Button type="submit">Next</Button>
          </Group>
        </FixedBottom>
      </form>
    </OnboardPage>
  )
}

export default ImportMnemonicForm

/* styles */
function selectStyles({ fn }: MantineTheme) {
  return {
    root: {
      background: fn.themeColor("mono.7"),
      borderRadius: 8,
      paddingLeft: 12,
      width: 120,
      "&:hover": { background: fn.themeColor("mono.6") },
    },
    input: { color: fn.themeColor("mono.0"), fontSize: 12, fontWeight: 500 },
    rightSection: { pointerEvents: "none" as const },
  }
}
