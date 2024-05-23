import { Flex, Group, Text } from "@mantine/core"
import type { InitiaAssetInfo } from "../../../data/tokens"
import Icon from "../../../styles/Icon"
import Num from "../../../components/Num"
import TokenLogo from "../../../components/TokenLogo"
import Selector from "./Selector"

interface Props {
  name: string
  options: Map<string, Partial<InitiaAssetInfo>>
  compact?: boolean
}

const SelectToken = ({ name, options, compact }: Props) => {
  return (
    <Selector
      label="Select token"
      name={name}
      data={options}
      toOptionItem={(asset) => {
        const { symbol, name, balance, decimals } = asset
        return {
          title: String(symbol),
          description: name,
          imageSection: <TokenLogo {...asset} size={28} />,
          rightSection: <Num amount={balance} decimals={decimals} size={14} decimalSize={12} fw={600} />,
        }
      }}
      renderSelectedItem={(selectedAssets) => (
        <Group spacing={4}>
          {!selectedAssets ? (
            "Select token"
          ) : (
            <Group position="apart" spacing={8}>
              {!compact ? <TokenLogo {...selectedAssets} size={20} /> : null}

              <Text fz={!compact ? 16 : 12} fw={700}>
                {selectedAssets.symbol}
              </Text>
            </Group>
          )}

          <Flex c="mono.4">
            <Icon.ChevronDown />
          </Flex>
        </Group>
      )}
      compact={compact}
    />
  )
}

export default SelectToken
