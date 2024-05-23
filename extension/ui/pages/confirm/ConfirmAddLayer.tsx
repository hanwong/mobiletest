import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Group, Image, Text } from "@mantine/core"
import { Prism } from "@mantine/prism"
import { request, useRequestedLayer } from "../../background"
import FixedBottom from "../../components/FixedBottom"
import ConfirmPage from "./ConfirmPage"

const ConfirmAddLayer = () => {
  const requested = useRequestedLayer()
  const queryClient = useQueryClient()

  const approve = useCallback(async () => {
    await request("approveRequestedLayer")
    await queryClient.invalidateQueries()
  }, [queryClient])

  const reject = useCallback(async () => {
    await request("rejectRequestedLayer")
    await queryClient.invalidateQueries()
  }, [queryClient])

  if (!requested) return null

  const { layer, sender } = requested
  const { url, favicon } = sender

  return (
    <ConfirmPage title="Add a new layer">
      <Group bg="mono.6" p={20} sx={{ borderRadius: 12 }}>
        <Image src={favicon} width={32} height={32} />
        <Text fw={600}>{url}</Text>
      </Group>

      <Prism language="json">{JSON.stringify(layer, null, 2)}</Prism>

      <FixedBottom>
        <Group grow>
          <Button variant="secondary" onClick={reject}>
            Reject
          </Button>
          <Button onClick={approve}>Approve</Button>
        </Group>
      </FixedBottom>
    </ConfirmPage>
  )
}

export default ConfirmAddLayer
