import { Anchor, Center, Stack, Text } from "@mantine/core"
import { getRPC } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import BigNumber from "bignumber.js"
import type { InitiaAssetInfo } from "../../data/tokens"
import { useAllBalances } from "../../data/interchain"
import { useAddress } from "../../background"
import LayerTokenInfo from "../../components/LayerTokenInfo"
import Empty from "../home/components/Empty"
import { useUpdateLayerValue } from "./data/values"
import AssetItemButton from "./components/AssetItemButton"
import sortAssets from "./data/sortAssets"

interface Props {
  layer: Chain
  asset: InitiaAssetInfo
  isFetching: boolean
}

const AssetItemInitia = ({ layer, asset, isFetching }: Props) => {
  const address = useAddress()
  useUpdateLayerValue({ address, chainId: layer.chain_id, denom: asset.denom, value: asset.value })

  return (
    <AssetItemButton
      asset={asset}
      tokenKey={asset.denom}
      layer={layer}
      search={{ layer: layer.chain_id, denom: asset.denom }}
      isFetching={isFetching}
      sx={{ "&:last-of-type": { borderBottomLeftRadius: 19, borderBottomRightRadius: 19 } }}
    />
  )
}

const AssetsInitiaLayer = (layer: Chain) => {
  const address = useAddress()
  const { data, isFetching, error } = useAllBalances(getRPC(layer), address)
  const balances = data?.filter(({ amount }) => BigNumber(amount).gt(0))

  const renderFaucetLink = () => {
    if (!layer.faucets?.length) return null

    const feeDenoms = layer.fees?.fee_tokens.map(({ denom }) => denom)
    if (!feeDenoms) return null
    if (!balances) return null

    const hasAnyFeeDenoms = balances.some(({ denom }) => feeDenoms.includes(denom))
    if (hasAnyFeeDenoms) return null

    return (
      <Center>
        <Anchor
          href={`${layer.faucets[0].url}?address=${address}`}
          target="_blank"
          size="xs"
          c="mono.0"
          p={4}
          td="underline"
        >
          Get testnet token
        </Anchor>
      </Center>
    )
  }

  if (error) {
    return (
      <Text c="danger" p="md">
        Failed to load assets
      </Text>
    )
  }

  if (!balances) return null
  if (balances.length === 0) {
    return (
      <Empty>
        <Text>No Assets</Text>
        {renderFaucetLink()}
      </Empty>
    )
  }

  return (
    <Stack spacing={1}>
      {renderFaucetLink()}
      {sortAssets(balances).map(({ denom, amount: balance }) => (
        <LayerTokenInfo layer={layer} denom={denom} key={denom}>
          {(token) => {
            const { price = 0, decimals } = token
            const value = BigNumber(balance).times(price).div(BigNumber(10).pow(decimals)).toNumber()
            return (
              <AssetItemInitia layer={layer} asset={{ ...token, balance, value }} isFetching={isFetching} key={denom} />
            )
          }}
        </LayerTokenInfo>
      ))}
    </Stack>
  )
}

export default AssetsInitiaLayer
