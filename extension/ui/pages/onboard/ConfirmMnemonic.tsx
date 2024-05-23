import { useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { mergeDeepRight } from "ramda"
import { Button, Group, Input, SimpleGrid, Text, TextInput } from "@mantine/core"
import type { CreateAccountParamsMnemonic } from "../../../scripts/types"
import { request } from "../../background"
import styles from "../../styles/styles"
import FixedBottom from "../../components/FixedBottom"
import OnboardPage from "./components/OnboardPage"
import OnboardBackButton from "./components/OnboardBackButton"

const ConfirmMnemonic = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  if (!state) throw new Error("No state provided")
  const data: CreateAccountParamsMnemonic = state
  const { mnemonic } = data

  const words = useMemo(() => mnemonic.split(" "), [mnemonic])
  const indices = useMemo(() => generateRandomNumbers(3, words.length), [words.length])
  const defaultValues = Object.fromEntries(indices.map((index) => [String(index), ""]))

  useEffect(() => {
    console.info(indices.map((index) => words[index]).join(" "))
  }, [indices, words])

  const { register, handleSubmit, formState } = useForm({ defaultValues })

  const submit = handleSubmit(async () => {
    await request("createAccount", data)
    navigate("/")
  })

  return (
    <OnboardPage
      title="Verify recovery phrase"
      subtitle="Type the word corresponding to the numbered order from the recovery phrase"
    >
      <form onSubmit={submit}>
        <SimpleGrid cols={3} spacing={16} verticalSpacing={8}>
          {words.map((word, index) => (
            <Group spacing={4} h={30} key={index}>
              <Input.Label fz={12} fw={600} w={16} ta="center">
                {index + 1}.
              </Input.Label>

              {indices.includes(index) ? (
                <TextInput
                  {...register(String(index), { validate: (value) => value === words[index] || "Incorrect word" })}
                  styles={(theme) =>
                    mergeDeepRight(styles.TextInput(theme), {
                      root: {
                        flex: 1,
                        minWidth: 0,
                      },
                      input: {
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        height: 30,
                        marginTop: 0,
                        paddingLeft: 12,
                        paddingRight: 12,
                      },
                    })
                  }
                  error={formState.errors[index]?.message}
                  autoFocus={index === indices[0]}
                />
              ) : (
                <Text c="mono.1" fz={12} fw={600}>
                  {word}
                </Text>
              )}
            </Group>
          ))}
        </SimpleGrid>

        <FixedBottom>
          <Group grow>
            <OnboardBackButton />
            <Button type="submit">Submit</Button>
          </Group>
        </FixedBottom>
      </form>
    </OnboardPage>
  )
}

export default ConfirmMnemonic

/* helpers */
function generateRandomNumbers(n: number, length: number) {
  const numbers: number[] = []

  while (numbers.length < n) {
    const randomNum = Math.floor(Math.random() * length)
    if (!numbers.includes(randomNum)) numbers.push(randomNum)
  }

  numbers.sort((a, b) => a - b)
  return numbers
}
