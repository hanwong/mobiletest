import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Button, Stack, TextInput } from "@mantine/core"
import { request } from "../../background"
import toast from "../../styles/toast"
import Page from "../../components/Page"
import FixedBottom from "../../components/FixedBottom"
import passwordScheme from "../onboard/passwordScheme"

const scheme = passwordScheme.and(z.object({ oldPassword: z.string() }))

const Password = () => {
  const navigate = useNavigate()

  const { register, handleSubmit, formState } = useForm<z.infer<typeof scheme>>({ resolver: zodResolver(scheme) })

  const submit = handleSubmit(async ({ oldPassword, password: newPassword }) => {
    try {
      await request("changePassword", { oldPassword, newPassword })
      toast.success("Password changed")
      navigate(-1)
    } catch (error) {
      toast.error("Failed to change password")
    }
  })

  return (
    <Page title="Change password">
      <form onSubmit={submit}>
        <Stack spacing={20}>
          <TextInput
            {...register("oldPassword")}
            label="Current Password"
            type="password"
            error={formState.errors.oldPassword?.message}
            autoFocus
          />

          <TextInput
            {...register("password")}
            label="New Password"
            type="password"
            error={formState.errors.password?.message}
          />

          <TextInput
            {...register("confirm")}
            label="Confirm new password"
            type="password"
            error={formState.errors.confirm?.message}
          />
        </Stack>

        <FixedBottom>
          <Button type="submit">Save</Button>
        </FixedBottom>
      </form>
    </Page>
  )
}

export default Password
