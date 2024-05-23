import { useCallback, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { mergeDeepRight } from "ramda"
import { Box, Button, Group, Input, Stack, Text, TextInput, UnstyledButton, useMantineTheme } from "@mantine/core"
import { useDisclosure, useElementSize } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { useQuery } from "@tanstack/react-query"
import {
  DEFAULT_SLIPPAGE_PERCENT,
  Tx,
  calcMinimum,
  getRest,
  required,
  toAmount,
  toQuantity,
  truncate,
  validateQuantityInput,
} from "@initia/utils"

import { defaultChain } from "../../../scripts/shared/chains"
import type { BaseAssetInfo } from "../../data/tokens"
import { useAddress, useLayers } from "../../background"
import styles from "../../styles/styles"
import Icon from "../../styles/Icon"
import Page from "../../components/Page"
import Num from "../../components/Num"
import FixedBottom from "../../components/FixedBottom"
import TokenLogo from "../../components/TokenLogo"

import useConfirm from "./helpers/useConfirm"
import SelectTargetChain from "./components/SelectTargetChain"
import SelectRecipient from "./components/SelectRecipient"
import SlippageTolerance from "./components/SlippageTolerance"
import FormError from "./components/FormError"
import Max from "./components/Max"
import Details from "./components/Details"

export interface SendValues {
  sourceChainId: string | number
  targetChainId: string | number
  recipientUsername?: string
  recipientAddress: string
  denom: string
  quantity: string
  memo: string
  slippage: string
}

interface Props extends BaseAssetInfo {
  denom: string
  chainId: string | number
  pairs?: Record<string, string>
}

const SendForm = ({ balance, symbol, decimals, denom, chainId, pairs, image }: Props) => {
  const { ref, width } = useElementSize()
  const theme = useMantineTheme()
  const defaultStyles = styles.TextInput(theme)

  const address = useAddress()
  const chain = defaultChain

  const layers = useLayers()
  const l1 = layers.find((layer) => layer.metadata?.is_l1)
  if (!l1) throw new Error("L1 not found")

  const confirm = useConfirm()

  /* form */
  const defaultValues = {
    denom,
    sourceChainId: chainId ?? chain.chainId,
    targetChainId: chainId ?? chain.chainId,
    recipientAddress: "",
    memo: "",
    quantity: "",
    slippage: String(DEFAULT_SLIPPAGE_PERCENT),
  }

  const [memoFixed, setMemoFixed] = useState(false)
  const form = useForm<SendValues>({ defaultValues })
  const { register, setValue, handleSubmit, watch, formState } = form
  const values = watch()
  const { sourceChainId, targetChainId, recipientAddress, memo, slippage = "" } = values

  const max = () => setValue("quantity", toQuantity(balance, decimals))

  const getDefinedLayer = useCallback(
    (chainId: string | number) => {
      return required(
        layers.find((layer) => layer.chain_id === chainId),
        "Layer not found",
      )
    },
    [layers],
  )

  const sourceLayer = useMemo(() => getDefinedLayer(sourceChainId), [getDefinedLayer, sourceChainId])
  const targetLayer = useMemo(() => getDefinedLayer(targetChainId), [getDefinedLayer, targetChainId])
  const amount = useMemo(() => toAmount(values.quantity, decimals), [values.quantity, decimals])

  const tx = useMemo(
    () => new Tx({ address, layer: sourceLayer, layer1: l1, modules: chain.modules, pairs }),
    [address, chain, l1, pairs, sourceLayer],
  )

  const send = useMemo(() => tx.send({ denom, targetLayer }), [denom, targetLayer, tx])

  /* simulation */
  const { data: simulated } = useQuery({
    queryKey: [getRest(l1), "Swap:Simulation", values],
    queryFn: async () => send.simulate({ amount }),
  })

  const minimum = useMemo(() => {
    if (!simulated) return
    return calcMinimum(simulated[0], slippage)
  }, [simulated, slippage])

  /* submit */
  const submit = handleSubmit(async () => {
    try {
      confirm({ messages: send.getMessages({ amount, recipientAddress, minimum }), memo }, chainId)
    } catch (error) {
      if (error instanceof Error) modals.open({ children: <Text c="danger">{error.message}</Text> })
    }
  })

  /* render */
  const showMemo = useMemo(() => {
    if (memoFixed) return false
    if (sourceChainId !== targetChainId) return false
    return true
  }, [memoFixed, sourceChainId, targetChainId])

  const [isMemoOpen, { toggle: toggleMemo }] = useDisclosure()
  const memoElement = !showMemo ? null : (
    <Box>
      <UnstyledButton onClick={toggleMemo}>
        <Group spacing={4}>
          <Icon.ChevronRight
            style={{ transition: "transform 150ms", transform: `rotate(${isMemoOpen ? "90deg" : "0"})` }}
          />
          <Text c="mono.2" fz={14} fw={600}>
            Memo (Optional)
          </Text>
        </Group>
      </UnstyledButton>

      {isMemoOpen && (
        <Box>
          <TextInput
            {...register("memo", {
              validate: {
                length: (value) => {
                  if (new Blob([value]).size <= 256) return
                  return "Memo must be less than 256 bytes"
                },
                brackets: (value) => {
                  if (value.includes("<") || value.includes(">")) return "Memo cannot include < or >"
                },
              },
            })}
            id="memo"
            error={formState.errors.memo?.message}
          />

          {!memo && (
            <FormError mt={8} info>
              Check if the above transaction requires a memo
            </FormError>
          )}
        </Box>
      )}
    </Box>
  )

  const quantityElement = (
    <Box>
      <Group position="apart">
        <Input.Label id="quantity" sx={defaultStyles.label}>
          Amount
        </Input.Label>
        <Max amount={balance} decimals={decimals} onClick={max} />
      </Group>

      <Box pos="relative">
        <Group spacing={4} pos="absolute" top={0} left={0} bottom={0} sx={{ zIndex: 1 }} px={20} ref={ref}>
          <TokenLogo image={image} size={20} />
          <Text>{truncate(symbol)}</Text>
        </Group>

        <TextInput
          {...register("quantity", { required: true, validate: validateQuantityInput({ balance, decimals }) })}
          id="quantity"
          placeholder="0"
          autoComplete="off"
          error={formState.errors.quantity?.message}
          styles={mergeDeepRight(defaultStyles, {
            input: { textAlign: "right" as const, paddingLeft: 2 * 20 + width },
          })}
        />
      </Box>
    </Box>
  )

  const details = !minimum
    ? undefined
    : [
        {
          title: "Minimum received",
          content: <Num amount={minimum} decimals={decimals} symbol={symbol} fixedByAmount />,
        },
      ]

  return (
    <Page title="Send">
      <FormProvider {...form}>
        <form onSubmit={submit}>
          <Stack spacing={20}>
            <SelectTargetChain />
            <SelectRecipient memoFixed={memoFixed} onMemoFixed={setMemoFixed} />
            {quantityElement}
            {memoElement}
            {details && <Details contents={details} />}
            {!!send.getSimulationParams({ amount }) && <SlippageTolerance />}
          </Stack>

          <FixedBottom>
            <Button type="submit">Next</Button>
          </FixedBottom>
        </form>
      </FormProvider>
    </Page>
  )
}

export default SendForm
