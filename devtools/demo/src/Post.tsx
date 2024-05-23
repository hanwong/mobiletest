import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Alert, Button, Loader, Stack, TextInput } from "@mantine/core"
import { CodeHighlight } from "@mantine/code-highlight"
import { MsgSend } from "@initia/initia.js"
import { toAmount } from "@initia/utils"
import { useAddress, useWallet } from "@initia/react-wallet-widget"

interface FormData {
  recipientAddress: string
  amount: string
  denom: string
  memo: string
}

const Post = () => {
  const address = useAddress()
  const { requestInitiaTx } = useWallet()

  const { register, handleSubmit } = useForm({
    defaultValues: { recipientAddress: address, amount: "1", denom: "uinit", memo: "" },
  })

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: ({ recipientAddress, amount, denom, memo }: FormData) => {
      const msgs = [
        MsgSend.fromProto({
          fromAddress: address,
          toAddress: recipientAddress,
          amount: [{ amount: toAmount(amount), denom }],
        }),
      ]

      return requestInitiaTx({ msgs, memo })
    },
  })

  const renderResult = () => {
    if (error instanceof Error) return <Alert color="red">{error.message}</Alert>
    if (isPending) return <Loader />
    if (data) return <CodeHighlight code={data} />
  }

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))}>
      <Stack>
        <TextInput {...register("recipientAddress")} label="Recipient Address" />
        <TextInput {...register("amount")} label="Amount" />
        <TextInput {...register("denom")} label="Denom" />
        <TextInput {...register("memo")} label="Memo" />
        <Button type="submit">Submit</Button>
        <Stack>{renderResult()}</Stack>
      </Stack>
    </form>
  )
}

export default Post
