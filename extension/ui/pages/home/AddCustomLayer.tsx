import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { Anchor, Button, Divider, ScrollArea, Stack, Text, TextInput, Textarea } from "@mantine/core"
import { Prism } from "@mantine/prism"
import { useDebouncedValue } from "@mantine/hooks"
import { ZodError } from "zod"
import { mergeDeepRight } from "ramda"
import { request } from "../../background"
import { transitionProps } from "../../styles/theme"
import toast from "../../styles/toast"
import styles from "../../styles/styles"
import FixedBottom from "../../components/FixedBottom"
import FormError from "../txs/components/FormError"
import useQueryChainJson, { validateChainJson, validateUrl } from "./useQueryChainJson"

const AddCustomLayer = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, watch, formState } = useForm<{ url: string; json: string }>()
  const { url = "", json = "" } = watch()

  /* simulate */
  const [debouncedUrl] = useDebouncedValue(url, 300)
  const chainJsonQuery = useQueryChainJson(debouncedUrl)

  /* submit */
  const queryClient = useQueryClient()
  const submit = handleSubmit(async () => {
    const data = validateUrl(debouncedUrl) ? chainJsonQuery.data : validateChainJson(json) ? JSON.parse(json) : null
    if (!data) throw new Error("Invalid data")

    try {
      await request("addCustomLayer", data)
      await queryClient.invalidateQueries()
      onClose()

      setTimeout(() => {
        toast.success("Minitia added")
      }, transitionProps.duration + 100)
    } catch (error) {
      onClose()

      setTimeout(() => {
        toast.error(String(error))
      }, transitionProps.duration + 100)
    }
  })

  /* render */
  const renderQueryResult = () => {
    if (!validateUrl(debouncedUrl)) return null

    const { data, isLoading, error } = chainJsonQuery

    if (error instanceof ZodError) {
      return (
        <ScrollArea h={200}>
          <Prism language="json">{JSON.stringify(error, null, 2)}</Prism>
        </ScrollArea>
      )
    }

    if (error instanceof Error) return <FormError>{error.message}</FormError>
    if (isLoading) return <Text>Loading...</Text>
    if (data) {
      return (
        <ScrollArea h={200}>
          <Prism language="json">{JSON.stringify(data, null, 2)}</Prism>
        </ScrollArea>
      )
    }
  }

  const disabled = useMemo(() => {
    if (validateUrl(debouncedUrl)) {
      return chainJsonQuery.isLoading || chainJsonQuery.isError
    }

    if (validateChainJson(json)) {
      return false
    }

    return true
  }, [chainJsonQuery, debouncedUrl, json])

  return (
    <form onSubmit={submit}>
      <Stack spacing={12} px={20}>
        <TextInput
          {...register("url", { validate: (value) => !value || validateUrl(value) })}
          label="Minitia chain.json URL"
          placeholder="https://"
          error={formState.errors.url?.message}
        />

        {validateUrl(debouncedUrl) ? (
          renderQueryResult()
        ) : (
          <>
            <Divider label="OR" />
            <Textarea
              {...register("json", { validate: (value) => !value || validateChainJson(value) })}
              label={
                <>
                  Minitia chain.json (
                  <Anchor target="_blank" href="https://devtools.testnet.initia.xyz/chain-json-generator">
                    Generate
                  </Anchor>
                  )
                </>
              }
              placeholder={JSON.stringify({ chain_id: "", chain_name: "" }, null, 2)}
              styles={(theme) =>
                mergeDeepRight(styles.TextInput(theme), {
                  input: { height: "initial", fontFamily: "monospace", fontSize: 12 },
                })
              }
              minRows={6}
            />
            {!!json && !validateChainJson(json) && <FormError>Chain schema is invalid</FormError>}
          </>
        )}
      </Stack>

      <FixedBottom>
        <Button type="submit" disabled={disabled}>
          Submit
        </Button>
      </FixedBottom>
    </form>
  )
}

export default AddCustomLayer
