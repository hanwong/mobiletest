import { Group, Loader, Text, UnstyledButton } from "@mantine/core"
import { modals } from "@mantine/modals"
import type { Coin } from "@cosmjs/amino"
import { formatAmount } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { useFindLayer } from "../../background"
import SelectToken from "../txs/components/SelectToken"
import { useInitiaFeeDenomOptions } from "./data"
import type { FeeContext } from "./context"

const DefinedFeeInitia = ({ layer, fee }: { layer: Chain; fee: Partial<Coin> }) => {
  const options = useInitiaFeeDenomOptions(layer)
  if (!fee.denom) return null
  return (
    <>
      {formatAmount(fee.amount, { decimals: options.get(fee.denom)?.decimals })}
      <SelectToken name="feeDenom" options={options} compact />
    </>
  )
}

const ConfirmTxFee = ({ chainId, feeContext }: { chainId: string | number; feeContext?: FeeContext }) => {
  const fee = feeContext?.fee
  const gasSimulation = feeContext?.gasSimulation
  const isEnough = feeContext?.isEnough

  const layer = useFindLayer(String(chainId))

  const renderDefinedFee = () => {
    if (layer && fee) {
      return <DefinedFeeInitia fee={fee} layer={layer} />
    }
  }

  if (gasSimulation?.error) {
    const showErrorMessage = () => {
      modals.open({ children: <Text c="danger">{String(gasSimulation.error)}</Text> })
    }

    return (
      <UnstyledButton c="danger" fz={12} fw={700} td="underline" onClick={showErrorMessage}>
        Failed to estimate
      </UnstyledButton>
    )
  }

  const renderNotEnough = (children: React.ReactNode) => {
    if (typeof isEnough === "boolean" && !isEnough) {
      return <Text c="danger">{children}</Text>
    }

    return children
  }

  return (
    <Group spacing={4}>
      {gasSimulation?.isFetching && <Loader size={12} />}
      {gasSimulation?.data ? renderNotEnough(renderDefinedFee()) : "Estimating..."}
    </Group>
  )
}

export default ConfirmTxFee
