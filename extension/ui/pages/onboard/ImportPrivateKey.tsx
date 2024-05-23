import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Button, Group, TextInput } from "@mantine/core"
import { request, useInitialized } from "../../background"
import toast from "../../styles/toast"
import FixedBottom from "../../components/FixedBottom"
import OnboardPage from "./components/OnboardPage"
import OnboardBackButton from "./components/OnboardBackButton"
import InitializeVault from "./InitializeVault"

const validatePrivateKey = {
  hex: (value = "") => {
    const hexRegex = /^[a-fA-F0-9]{64}$/
    return hexRegex.test(value) || "Private key must be a 64-character hex string"
  },
}

const ImportPrivateKeyForm = () => {
  const navigate = useNavigate()
  const initialized = useInitialized()

  const defaultValues = { privateKey: "" }
  const { register, handleSubmit, formState } = useForm({ defaultValues })

  const submit = useMutation({
    mutationFn: async (privateKey: string) => {
      await request("createAccount", { privateKey })
      navigate("/")
    },
    onError: (error) => {
      toast.error(String(error))
    },
  })

  if (!initialized) return <InitializeVault />

  return (
    <OnboardPage title="Import private key" subtitle="Enter the private key of the account to add.">
      <form onSubmit={handleSubmit((values) => submit.mutate(values.privateKey))}>
        <TextInput
          {...register("privateKey", {
            setValueAs: (value: string) => (value.startsWith("0x") ? value.slice(2) : value),
            validate: validatePrivateKey,
          })}
          autoFocus
          error={formState.errors.privateKey?.message}
        />

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

export default ImportPrivateKeyForm
