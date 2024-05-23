import qs from "qs"
import { Center, Divider, Group, Image, Stack, Text, Title } from "@mantine/core"
import { ASSETS_URL } from "../../../scripts/shared/constants"
import FullHeightFlex from "../../components/FullHeightFlex"
import useOpenTab from "./useOpenTab"
import OnboardButton from "./OnboardButton"
import providers from "./providers"

const options = [
  { to: "/account/new", label: "Create a new account" },
  { to: "/account/import/mnemonic", label: "Import recovery phrase" },
  { to: "/account/import/private-key", label: "Import private key" },
]

const Onboard = () => {
  useOpenTab()

  return (
    <FullHeightFlex
      header={
        <Center>
          <Stack spacing={8}>
            <Group spacing={12}>
              <Image src={`${ASSETS_URL}/INIT.svg`} width={42} height={42} />
              <Title fz={42} fw={900}>
                Initia
              </Title>
            </Group>
            <Text c="mono.3" fz={20} fw={600}>
              Initiate the Move
            </Text>
          </Stack>
        </Center>
      }
      footer={
        <>
          <Group spacing={8} position="center">
            {[...providers]
              .filter(([, { index }]) => index)
              .map(([provider, { logo }]) => (
                <OnboardButton
                  to={{ pathname: "/account/social", search: qs.stringify({ provider }) }}
                  logo={logo}
                  key={provider}
                >
                  {toSentenceCase(provider)}
                </OnboardButton>
              ))}
          </Group>

          <Divider my={12} />

          <Group spacing={8} position="center">
            {options.map(({ to, label }) => (
              <OnboardButton to={to} key={to}>
                {label}
              </OnboardButton>
            ))}
          </Group>
        </>
      }
    />
  )
}

export default Onboard

/* utils */
function toSentenceCase(str: string) {
  return str[0].toUpperCase() + str.slice(1)
}
