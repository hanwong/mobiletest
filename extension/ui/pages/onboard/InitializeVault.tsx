import type z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Checkbox, Group, Stack, TextInput } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import { request } from "../../background"
import FixedBottom from "../../components/FixedBottom"
import OnboardPage from "./components/OnboardPage"
import OnboardBackButton from "./components/OnboardBackButton"
import passwordScheme from "./passwordScheme"

const InitializeVault = () => {
  const [checked, setChecked] = useState(false)
  const { register, handleSubmit, formState } = useForm<z.infer<typeof passwordScheme>>({
    resolver: zodResolver(passwordScheme),
  })

  const queryClient = useQueryClient()
  const submit = handleSubmit(async ({ password }) => {
    await request("initializeVault", password)
    await queryClient.invalidateQueries()
  })

  return (
    <OnboardPage
      title="Set password"
      subtitle="Your password can unlock your wallet only on this local device. If you forget your password, you will not be able to access your wallet on this device."
    >
      <form onSubmit={submit}>
        <Stack spacing={32}>
          <TextInput
            {...register("password")}
            label="Password"
            type="password"
            error={formState.errors.password?.message}
            autoFocus
          />

          <TextInput
            {...register("confirm")}
            label="Confirm password"
            type="password"
            error={formState.errors.confirm?.message}
          />

          <Checkbox
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
            label="I understand that I will not be able to access my wallet on this device if I forget my password"
          />
        </Stack>

        <FixedBottom>
          <Group grow>
            <OnboardBackButton />
            <Button type="submit" disabled={!checked}>
              Next
            </Button>
          </Group>
        </FixedBottom>
      </form>
    </OnboardPage>
  )
}

export default InitializeVault
