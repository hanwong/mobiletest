import { useState } from "react"
import { useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Alert, Box, Button, CopyButton, Group, Overlay, Stack, Text, TextInput, UnstyledButton } from "@mantine/core"
import { request } from "../../background"
import toast from "../../styles/toast"
import Icon from "../../styles/Icon"
import HomeHeader from "../home/components/HomeHeader"
import Page from "../../components/Page"
import FixedBottom from "../../components/FixedBottom"

const Form = ({ onSubmit }: { onSubmit: () => void }) => {
  const { register, handleSubmit, formState } = useForm<{ password: string }>({ defaultValues: { password: "" } })

  const submit = handleSubmit(async ({ password }) => {
    try {
      await request("unlock", password)
      onSubmit()
    } catch (error) {
      toast.error("Incorrect password")
    }
  })

  return (
    <form onSubmit={submit}>
      <Stack spacing={20}>
        <TextInput
          {...register("password")}
          label="Password"
          type="password"
          error={formState.errors.password?.message}
        />
      </Stack>

      <FixedBottom>
        <Button type="submit">Confirm</Button>
      </FixedBottom>
    </form>
  )
}

const PrivateKey = () => {
  const { address } = useParams()

  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const { data: privateKey } = useQuery({
    queryKey: ["getPrivateKey", address],
    queryFn: () => request("getPrivateKey", address),
  })

  if (!privateKey) return null

  const warningMessage =
    "This private key is the credential for your assets. Do not lose or expose it to others, as this may result in permanent loss of your assets. Store it carefully in a secure environment."

  const copyButton = (
    <Box pos="relative" bg="mono.7" p={20} sx={{ borderRadius: 8 }}>
      {!visible && (
        <Overlay color="#000" opacity={0} blur={5} zIndex={5} center>
          <UnstyledButton
            onClick={toggle}
            sx={({ fn }) => ({ color: fn.themeColor("mono.0"), fontSize: 12, fontWeight: 600 })}
          >
            <Group spacing={2}>
              <Icon.Show width={14} height={14} />
              <Text>Reveal</Text>
            </Group>
          </UnstyledButton>
        </Overlay>
      )}

      <CopyButton value={privateKey}>
        {({ copy, copied }) => (
          <Group>
            <Text style={{ flex: 1, wordBreak: "break-all" }}>
              {privateKey}{" "}
              {copied && (
                <Text c="success" fz={12} fw={700} span>
                  Copied
                </Text>
              )}
            </Text>

            <UnstyledButton onClick={copy}>
              <Icon.Copy />
            </UnstyledButton>
          </Group>
        )}
      </CopyButton>
    </Box>
  )

  return (
    <Stack>
      <Alert color="danger">{warningMessage}</Alert>

      {copyButton}
    </Stack>
  )
}

const ExportPrivateKey = () => {
  const [authenticated, setAuthenticated] = useState(false)

  return (
    <>
      <HomeHeader />

      <Page title="Backup private key">
        {authenticated ? <PrivateKey /> : <Form onSubmit={() => setAuthenticated(true)} />}
      </Page>
    </>
  )
}

export default ExportPrivateKey
