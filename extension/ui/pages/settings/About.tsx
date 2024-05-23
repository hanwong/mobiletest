import { Anchor, Button, Divider, Group, Image, Stack, Text } from "@mantine/core"
import Icon from "../../styles/Icon"
import Page from "../../components/Page"

const About = () => {
  return (
    <Page title="About">
      <Stack spacing={20}>
        <Stack spacing={8}>
          {["app", "usernames"].map((subdomain) => {
            const url = `https://${subdomain}.testnet.initia.xyz`
            const logo = new URL("logo.png", url)
            return (
              <Button
                variant="item"
                component={Anchor}
                // @ts-expect-error
                href={url}
                target="_blank"
                rightIcon={<Icon.ExternalLink />}
                key={url}
              >
                <Image src={logo.href} width="auto" height={20} />
              </Button>
            )
          })}

          <Divider variant="dashed" my={20} />

          <Button
            variant="item"
            component={Anchor}
            // @ts-expect-error
            href="https://initia.co/privacy"
            target="_blank"
            h={56}
          >
            <Group spacing={8}>
              <Icon.Privacy />
              <Text>Privacy policy</Text>
            </Group>
          </Button>
        </Stack>

        <Button.Group>
          {[
            { label: "Twitter", href: "https://twitter.com/initiaFDN" },
            { label: "GitHub", href: "https://github.com/initia-labs" },
          ].map(({ href, label }) => (
            <Button component="a" href={href} target="_blank" size="sm" fz={12} h={36} key={href}>
              {label}
            </Button>
          ))}
        </Button.Group>

        <Text c="mono.3" fz={12} fw={600} ta="center">
          Version: {chrome.runtime?.getManifest().version}
        </Text>
      </Stack>
    </Page>
  )
}

export default About
