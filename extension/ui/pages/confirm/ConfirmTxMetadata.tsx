import { Group, Image, Stack, Text } from "@mantine/core"
import { truncate } from "@initia/utils"
import type { Sender } from "../../../scripts/types"
import { defaultChain } from "../../../scripts/shared/chains"
import { useAddress, useFindLayer } from "../../background"
import type { FeeContext } from "./context"
import ConfirmTxFee from "./ConfirmTxFee"

interface Props {
  sender?: Sender
  chainId?: string | number
  skipGasSimulation?: boolean
  memo?: string
  feeContext?: FeeContext
}

const ConfirmTxMetadata = ({ sender, chainId, skipGasSimulation, memo, feeContext }: Props) => {
  const isEnough = feeContext?.isEnough

  const layer = useFindLayer(String(chainId))
  const address = useAddress()

  const renderChain = () => {
    if (!chainId) return null
    const name = layer?.pretty_name ?? layer?.chain_name ?? defaultChain.displayName
    const logo = layer?.logo_URIs?.png ?? defaultChain.logo

    return (
      <Group spacing={4}>
        <Image src={logo} width={16} height={16} />
        {name}
      </Group>
    )
  }

  const renderSender = () => {
    if (!sender) return null

    return (
      <Group spacing={4}>
        <Image src={sender.favicon} width={16} height={16} />
        {sender.url}
      </Group>
    )
  }

  const renderFee = () => {
    if (!chainId) return null
    if (skipGasSimulation) return null
    return <ConfirmTxFee chainId={chainId} feeContext={feeContext} />
  }

  /* render: general */
  const contents = [
    { title: "Origin", content: renderSender() },
    { title: "Network", content: renderChain() },
    { title: "Account", content: truncate(address) },
    { title: "Fee", content: renderFee() },
    { title: "Memo", content: memo },
  ]

  return (
    <Stack spacing={0}>
      {contents.map(({ title, content }, index) => {
        if (!content) return null

        return (
          <Group position="apart" h={32} key={index}>
            <Text fz={12} c="mono.3">
              {title}
            </Text>

            <Text fz={12}>{content}</Text>
          </Group>
        )
      })}

      {typeof isEnough === "boolean" && !isEnough && (
        <Text c="danger" fz={12} ta="right">
          Insufficient balance to pay fee
        </Text>
      )}
    </Stack>
  )
}

export default ConfirmTxMetadata
