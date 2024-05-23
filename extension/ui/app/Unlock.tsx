import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button, Stack, TextInput, Title } from "@mantine/core"
import { request } from "../background"
import FullHeightFlex from "../components/FullHeightFlex"

const Unlock = () => {
  const { register, handleSubmit } = useForm<{ password: string }>()

  const [passwordError, setPasswordError] = useState(false)
  const submit = handleSubmit(async ({ password }) => {
    setPasswordError(false)

    try {
      await request("unlock", password)
    } catch {
      setPasswordError(true)
    }
  })

  return (
    <form onSubmit={submit}>
      <FullHeightFlex
        header={
          <>
            <Title size={48} fw={900}>
              👋 Hello!
            </Title>
          </>
        }
        footer={
          <Stack spacing={20}>
            <TextInput
              {...register("password")}
              type="password"
              placeholder="Password"
              error={passwordError && "Incorrect password"}
              autoFocus
            />
            <Button type="submit">Unlock</Button>
          </Stack>
        }
      />
    </form>
  )
}

export default Unlock
