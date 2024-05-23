import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Button, Stack, TextInput } from "@mantine/core"
import { CodeHighlight } from "@mantine/code-highlight"
import { useWallet } from "@initia/react-wallet-widget"

interface FormData {
  data: string
}

const Arbitrary = () => {
  const { signArbitrary, verifyArbitrary } = useWallet()

  const { register, getValues, handleSubmit } = useForm({
    defaultValues: { data: "Hello, World!" },
  })

  const signed = useMutation({
    mutationFn: ({ data }: FormData) => signArbitrary(data),
  })

  const verified = useMutation({
    mutationFn: ({ data, signature }: { data: string; signature: string }) => verifyArbitrary(data, signature),
  })

  const renderResult = () => {
    if (!signed.data) return null

    return (
      <Stack>
        <CodeHighlight language="json" code={signed.data} />
        <Button
          type="button"
          onClick={() => verified.mutate({ data: getValues("data"), signature: signed.data })}
          disabled={!verified.isIdle}
        >
          {verified.isIdle ? "Verify" : verified.data ? "Verified" : "Not Verified"}
        </Button>
      </Stack>
    )
  }

  return (
    <form onSubmit={handleSubmit((values) => signed.mutate(values))}>
      <Stack>
        <TextInput {...register("data")} />
        <Button type="submit">Sign</Button>
        {renderResult()}
      </Stack>
    </form>
  )
}

export default Arbitrary
