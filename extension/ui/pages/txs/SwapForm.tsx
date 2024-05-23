import { useMemo } from "react"
import { FormProvider, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { mergeDeepRight } from "ramda"
import { useQuery } from "@tanstack/react-query"
import type { MantineTheme } from "@mantine/core"
import { Box, Button, Group, Input, Stack, TextInput, UnstyledButton, useMantineTheme } from "@mantine/core"
import { useDebouncedValue, useElementSize } from "@mantine/hooks"
import type { Chain } from "@initia/initia-registry-types"
import {
  DEFAULT_SLIPPAGE_PERCENT,
  Tx,
  calcMinimum,
  formatAmount,
  formatPercent,
  getRPC,
  getRest,
  required,
  toAmount,
  toQuantity,
  validateQuantityInput,
} from "@initia/utils"

import { defaultChain } from "../../../scripts/shared/chains"
import type { InitiaAssetInfo } from "../../data/tokens"
import { useTokens } from "../../data/tokens"
import { useSwaplist } from "../../data/swap"
import { useAllBalances } from "../../data/interchain"
import { useRelativePrice } from "../../data/price"
import { useAddress, useDefinedLayer1 } from "../../background"
import styles from "../../styles/styles"
import Icon from "../../styles/Icon"
import Page from "../../components/Page"
import Num from "../../components/Num"
import FixedBottom from "../../components/FixedBottom"
import HomeHeader from "../home/components/HomeHeader"

import useConfirm from "./helpers/useConfirm"
import SlippageTolerance from "./components/SlippageTolerance"
import SelectToken from "./components/SelectToken"
import Price from "./components/Price"
import Max from "./components/Max"
import Details from "./components/Details"

const DEBOUNCE_DELAY = 300

interface SwapTokens {
  offerDenom: string
  askDenom: string
}

export interface SwapValues extends SwapTokens {
  quantity: string
  slippage: string
}

interface Props {
  layer: Chain
  pairs?: Record<string, string>
  initialOfferDenom: string
  swappable: string[]
}

const SwapForm = ({ layer, initialOfferDenom, pairs, swappable }: Props) => {
  const { ref, height } = useElementSize()
  const theme = useMantineTheme()

  const confirm = useConfirm()

  const chain = defaultChain
  const tokens = useTokens()
  const swaplist = useSwaplist()

  const address = useAddress()
  const { data: balances = [] } = useAllBalances(getRPC(layer), address)

  /* form */
  const defaultValues = {
    offerDenom: initialOfferDenom,
    askDenom: "",
    slippage: String(DEFAULT_SLIPPAGE_PERCENT),
  }

  const form = useForm<SwapValues>({ defaultValues })
  const { register, setValue, handleSubmit, watch, formState } = form
  const values = watch()
  const { quantity = "", offerDenom = "", askDenom = "", slippage = "" } = values

  const reverse = () => {
    setValue("askDenom", offerDenom)
    setValue("offerDenom", askDenom)
  }

  const [debouncedQuantity] = useDebouncedValue(quantity, DEBOUNCE_DELAY)

  /* tx */
  const poolPrice = useRelativePrice(offerDenom, askDenom)
  const layer1 = useDefinedLayer1()

  const tx = useMemo(
    () => new Tx({ address, layer, layer1, modules: chain.modules, pairs }),
    [address, chain, layer, layer1, pairs],
  )

  const offerToken = tokens.get(tx.getL1Denom(offerDenom))
  const askToken = tokens.get(tx.getL1Denom(askDenom))
  const offer = { symbol: offerToken?.symbol ?? "", decimals: offerToken?.decimals ?? 6 }
  const ask = { symbol: askToken?.symbol ?? "", decimals: askToken?.decimals ?? 6 }

  const amount = toAmount(debouncedQuantity, offer.decimals)

  const swap = useMemo(() => tx.swap({ offerDenom, askDenom, swaplist }), [askDenom, offerDenom, swaplist, tx])

  /* simulate */
  const simulationParams = useMemo(() => ({ amount, offerDenom, askDenom }), [amount, offerDenom, askDenom])
  const simulation = useQuery({
    queryKey: [getRest(layer1), "Swap:Simulation", simulationParams] as const,
    queryFn: () => swap.simulate({ amount }),
  })

  /* swap fee */
  const { data: swapFeeRate } = useQuery({
    queryKey: [getRest(layer1), "config", simulationParams] as const,
    queryFn: () => swap.fetchSwapFeeRate(),
  })

  /* render */
  const options = useMemo(() => {
    const entries = swappable
      .map((denom) => {
        const balance = balances.find((coin) => coin.denom === denom)?.amount ?? "0"
        const token = tokens.get(tx.getL1Denom(denom))
        if (!token) return undefined
        return { ...token, denom, balance }
      })
      .filter((asset): asset is InitiaAssetInfo => !!asset)
      .map((asset) => [asset.denom, asset] as const)

    return new Map(entries)
  }, [balances, swappable, tokens, tx])

  /* max */
  const balance = options.get(offerDenom)?.balance ?? "0"
  const max = () => setValue("quantity", toQuantity(balance, offer.decimals))

  /* submit */
  const submit = handleSubmit(() => {
    if (simulation.isLoading) throw new Error("Simulating...")
    const { returnAmount: simulated } = required(simulation.data)
    confirm({ messages: swap.getMessages({ amount, simulated, slippagePercent: slippage }) }, layer.chain_id)
  })

  /* styles */
  const inputStyles = (theme: MantineTheme) => {
    return mergeDeepRight(styles.TextInput(theme), {
      input: {
        marginTop: 0,
        fontSize: 24,
        fontWeight: 700,
        height: 60 + height,
        paddingTop: height,
        textAlign: "right",
      },
      error: { textAlign: "right" },
    } as const)
  }

  const offerElement = (
    <Stack spacing={16} pos="relative">
      <Box pos="absolute" top={0} left={0} right={0} sx={{ zIndex: 1 }} ref={ref}>
        <Group position="apart" px={20} pt={24}>
          <SelectToken name="offerDenom" options={options} />
          <Max amount={balance} decimals={offer.decimals} onClick={max} />
        </Group>
      </Box>

      <TextInput
        {...register("quantity", {
          required: true,
          validate: validateQuantityInput({ balance, decimals: offer.decimals }),
        })}
        placeholder="0"
        autoComplete="off"
        autoFocus
        styles={mergeDeepRight(inputStyles(theme), {
          input: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
        })}
      />
    </Stack>
  )

  const switchButton = (
    <UnstyledButton
      bg="mono.6"
      pos="absolute"
      top="50%"
      left="50%"
      w={24}
      h={24}
      sx={({ fn }) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
        boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.2)",
        ...fn.hover({ background: fn.themeColor("mono.5") }),
      })}
      onClick={reverse}
    >
      <Icon.ArrowRight width={12} height={12} style={{ transform: "rotate(90deg)" }} />
    </UnstyledButton>
  )

  const renderSimulatedText = () => {
    if (!simulation.data) return ""
    const { returnAmount } = simulation.data
    const returnQuantity = toQuantity(returnAmount, ask.decimals)
    const fixed = BigNumber(returnQuantity).gt(1000) ? 2 : 6
    return formatAmount(returnAmount, { fixed })
  }

  const askElement = (
    <Stack spacing={16} pos="relative">
      <Box pos="absolute" top={0} left={0} right={0} sx={{ zIndex: 1 }} ref={ref}>
        <Group position="apart" px={20} pt={24}>
          <SelectToken name="askDenom" options={options} />
        </Group>
      </Box>

      <TextInput
        value={renderSimulatedText()}
        placeholder={simulation.isFetching ? "Simulating..." : "0"}
        styles={(theme) =>
          mergeDeepRight(inputStyles(theme), { input: { borderTopLeftRadius: 0, borderTopRightRadius: 0 } })
        }
        readOnly
      />
    </Stack>
  )

  const poolPriceElement = !poolPrice ? undefined : (
    <Price price={poolPrice} offerSymbol={offer.symbol} askSymbol={ask.symbol} />
  )

  const expectedPriceElement = !simulation.data ? undefined : (
    <Price price={simulation.data.expectedPrice} offerSymbol={offer.symbol} askSymbol={ask.symbol} />
  )

  const minimumReceivedElement = !simulation.data ? undefined : (
    <Num
      amount={calcMinimum(simulation.data.returnAmount, slippage)}
      decimals={ask.decimals}
      symbol={ask.symbol}
      fixedByAmount
    />
  )

  const swapFeeElement = !swapFeeRate ? undefined : formatPercent(swapFeeRate, false)

  const renderPriceImpact = () => {
    if (!simulation.data) return null
    const { priceImpact } = simulation.data
    const SMALLEST = 0.0001
    if (BigNumber(priceImpact).lt(SMALLEST)) return `<${formatPercent(SMALLEST)}`
    return formatPercent(priceImpact)
  }

  const details = [
    { title: "Pool price", content: poolPriceElement },
    { title: "Expected price", content: expectedPriceElement },
    { title: "Minimum received", content: minimumReceivedElement },
    { title: "Price impact", content: renderPriceImpact() },
    { title: "Swap fee", content: swapFeeElement },
  ]

  return (
    <>
      <HomeHeader />
      <Page title="Swap">
        <FormProvider {...form}>
          <form onSubmit={submit}>
            <Stack bg="mono.6" spacing={1} sx={{ borderRadius: 20 }} pos="relative">
              {offerElement}
              {switchButton}
              {askElement}
            </Stack>

            <Input.Error ta="right" sx={inputStyles(theme).error}>
              {formState.errors.quantity?.message}
            </Input.Error>

            <Details contents={details} />
            <SlippageTolerance />

            <FixedBottom>
              <Button type="submit" disabled={simulation.isFetching}>
                Next
              </Button>
            </FixedBottom>
          </form>
        </FormProvider>
      </Page>
    </>
  )
}

export default SwapForm
