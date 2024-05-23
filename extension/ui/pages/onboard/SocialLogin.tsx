import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Alert, Center } from "@mantine/core"
import { request, useInitialized } from "../../background"
import Page from "../../components/Page"
import Video from "../../components/Video"
import { requestUserInfo } from "./web3auth"
import InitializeVault from "./InitializeVault"

const SocialLoginComponent = () => {
  const { search } = useLocation()
  const provider = new URLSearchParams(search).get("provider")
  if (!provider) throw new Error("Provider is not specified")

  const navigate = useNavigate()

  const { mutate: submit, error } = useMutation({
    mutationFn: async () => {
      const { email, name, privateKey } = await requestUserInfo(provider)
      return await request("createAccount", { privateKey, payload: { provider, name, email } })
    },
    onSuccess: () => navigate("/"),
  })

  useEffect(() => {
    submit()
  }, [submit])

  if (error) {
    return (
      <Page>
        <Alert color="danger">{String(error)}</Alert>
      </Page>
    )
  }

  return (
    <Center h="100vh">
      <Video name="Loading" />
    </Center>
  )
}

const SocialLogin = () => {
  const initialized = useInitialized()
  if (!initialized) return <InitializeVault />
  return <SocialLoginComponent />
}

export default SocialLogin
