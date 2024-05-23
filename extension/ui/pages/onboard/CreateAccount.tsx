import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { generateMnemonic } from "bip39"
import { Button, Group } from "@mantine/core"
import { useInitialized } from "../../background"
import FixedBottom from "../../components/FixedBottom"
import OnboardPage from "./components/OnboardPage"
import OnboardBackButton from "./components/OnboardBackButton"
import MnemonicOverlay from "./MnemonicOverlay"
import InitializeVault from "./InitializeVault"

const CreateAccountForm = () => {
  const navigate = useNavigate()
  const initialized = useInitialized()

  const mnemonic = useMemo(() => {
    return generateMnemonic()
  }, [])

  const submit = async () => {
    const data = { mnemonic, index: 0 }
    navigate("confirm", { state: data })
  }

  if (!initialized) return <InitializeVault />

  return (
    <OnboardPage
      title="Recovery phrase"
      subtitle="Keep this words in a safe place. If you lose your recovery phrase, you lose your assets forever. Never share
          with anyone."
    >
      <MnemonicOverlay>{mnemonic}</MnemonicOverlay>

      <FixedBottom>
        <Group grow>
          <OnboardBackButton />
          <Button onClick={submit}>Next</Button>
        </Group>
      </FixedBottom>
    </OnboardPage>
  )
}

export default CreateAccountForm
