import { Fragment } from "react"
import { useFormContext } from "react-hook-form"
import { descend, sortWith } from "ramda"
import { Button, Container, Drawer, Group, Image, Stack, Text, UnstyledButton } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import type { Chain } from "@initia/initia-registry-types"
import { useAddress, useLayers } from "../../../background"
import Icon from "../../../styles/Icon"
import { useGetLayerValue } from "../../assets/data/values"
import type { SendValues } from "../SendForm"

const SelectTargetChain = () => {
  const [opened, { open, close }] = useDisclosure()

  const layers = useLayers()
  const address = useAddress()
  const getLayerValue = useGetLayerValue(address)

  const { register, watch } = useFormContext<SendValues>()
  const { targetChainId } = watch()

  const renderSelected = (label: string, logo?: string) => {
    return (
      <Group spacing={6}>
        <Image src={logo} width={20} height={20} />
        <Text fz={18} fw={600}>
          {label}
        </Text>
      </Group>
    )
  }

  const renderButtonContent = () => {
    const targetLayer = layers.find(({ chain_id }) => chain_id === targetChainId)

    if (targetLayer) {
      const { chain_name, pretty_name, logo_URIs } = targetLayer
      return renderSelected(pretty_name || chain_name, logo_URIs?.png)
    }

    return "Select a destination"
  }

  const renderGroup = ({
    name,
    title,
    list,
  }: {
    name: keyof SendValues
    title: string
    list: { key: string; label: string; logo?: string }[]
  }) => {
    if (list.length === 0) return null

    return (
      <>
        <Text c="mono.4" fz={10} fw={700} mb={4}>
          {title}
        </Text>

        <Stack spacing={0}>
          {list.map(({ key, label, logo }) => (
            <Fragment key={key}>
              <UnstyledButton
                px={20}
                py={8}
                mx={-20}
                c="mono.1"
                sx={({ fn }) => ({
                  ...fn.hover({ background: fn.themeColor("mono.6") }),
                })}
                onClick={close}
                component="label"
                htmlFor={key}
              >
                <Group spacing={8}>
                  <Image src={logo} width={16} height={16} />
                  <Text fz={14} fw={600}>
                    {label}
                  </Text>
                </Group>
              </UnstyledButton>

              <input type="radio" id={key} value={key} {...register(name)} hidden />
            </Fragment>
          ))}
        </Stack>
      </>
    )
  }

  return (
    <>
      <Stack spacing={8}>
        <Text c="mono.2" fz={14} fw={600}>
          Destination Network
        </Text>

        <Button variant="item" h={72} rightIcon={<Icon.ChevronDown />} onClick={open}>
          {renderButtonContent()}
        </Button>
      </Stack>

      <Drawer opened={opened} onClose={close} title="Select a destination">
        <Container px={20} py={12}>
          {renderGroup({
            name: "targetChainId",
            title: "Omnitia Network",
            list: sortWith<Chain>([
              descend(({ metadata }) => !!metadata?.is_l1),
              descend(({ chain_name }) => getLayerValue(chain_name)),
            ])(layers).map(({ chain_name, pretty_name, logo_URIs, chain_id }) => ({
              label: pretty_name ?? chain_name,
              logo: logo_URIs?.png,
              key: chain_id,
            })),
          })}
        </Container>
      </Drawer>
    </>
  )
}

export default SelectTargetChain
