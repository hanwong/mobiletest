import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { createHTTPClient, createInitiaMoveClient, getAPI, getRPC, required } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import BigNumber from "bignumber.js"
import { defaultChain } from "../../../scripts/shared/chains"
import type { InitiaAssetInfo } from "../../data/tokens"
import { useTokens } from "../../data/tokens"
import { useAllBalances } from "../../data/interchain"
import { request, useAddress, useDefinedLayer1 } from "../../background"
import { getTokenFromAsset, useAssetsQuery, usePairsQuery } from "../../data/layers"
import { useTxConfirmContext } from "./context"

export function useMoveParams() {
  const chain = defaultChain
  return useQuery({
    queryKey: [chain.chainId, "Move:Params"],
    queryFn: () => {
      const client = createInitiaMoveClient(chain.rest)
      return client.params()
    },
  })
}

export function useGasSimulation() {
  const { txBody, chainId, skipGasSimulation } = useTxConfirmContext()

  return useQuery({
    queryKey: [chainId, "Gas:Simulate", txBody],
    queryFn: () => request("simulateCosmosTx", { chainId, txBody }),
    enabled: !skipGasSimulation,
  })
}

function useWithBalance(denoms: string[], chain: Chain) {
  const address = useAddress()
  const tokens = useTokens()
  const { data: balances } = useAllBalances(getRPC(chain), address)
  const { data: pairs = {} } = usePairsQuery(chain)
  const { data: assets } = useAssetsQuery(chain)
  const isL1 = chain.metadata?.is_l1

  return useMemo(() => {
    if (tokens.size === 0) return new Map()

    const withBalance = denoms
      .map<InitiaAssetInfo>((denom) => {
        const l1Denom = isL1 ? denom : pairs[denom]
        const balance = balances?.find((coin) => denom === coin.denom)?.amount ?? "0"

        const token = tokens.get(l1Denom)
        if (token) return { ...token, denom, balance }

        const asset = assets?.find((asset) => asset.base === denom)
        if (asset) return { ...getTokenFromAsset(asset), balance }

        return { symbol: denom, decimals: 0, metadata: "", denom, balance }
      })
      .sort(({ balance: a }, { balance: b }) => {
        if (BigNumber(a).gt(0) && !BigNumber(b).gt(0)) return -1
        if (!BigNumber(a).gt(0) && BigNumber(b).gt(0)) return 1
        return 0
      })

    return new Map(withBalance.map((asset) => [asset.denom, asset]))
  }, [tokens, denoms, isL1, pairs, balances, assets])
}

export function useInitiaFeeDenomOptions(layer: Chain) {
  const feeDenoms = useMemo(() => layer.fees?.fee_tokens.map((token) => token.denom) ?? [], [layer.fees?.fee_tokens])

  const assets = useWithBalance(feeDenoms, layer)

  return useMemo(() => {
    if (assets.size === 0) return new Map()

    return new Map(
      feeDenoms.map<[string, InitiaAssetInfo]>((denom) => [
        denom,
        required(assets.get(denom), `Token not found: ${denom}`),
      ]),
    )
  }, [assets, feeDenoms])
}

export function useGasPricesQuery(layer: Chain) {
  const layer1 = useDefinedLayer1()
  const api = required(getAPI(layer1))

  return useQuery({
    queryKey: [api],
    queryFn: async () => createHTTPClient(api).get<Record<string, string>>("/indexer/price/v1/gas_prices"),
    enabled: !!layer.metadata?.is_l1,
  })
}
