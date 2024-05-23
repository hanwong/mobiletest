import { useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Group, Image, Text } from "@mantine/core"
import { request, useRequestedPermission } from "../../background"
import FixedBottom from "../../components/FixedBottom"
import ConfirmPage from "./ConfirmPage"

const ConfirmPermission = () => {
  const requested = useRequestedPermission()
  const queryClient = useQueryClient()

  const approve = useCallback(async () => {
    await request("approveRequestedPermission")
    await queryClient.invalidateQueries()
  }, [queryClient])

  const reject = useCallback(async () => {
    await request("rejectRequestedPermission")
    await queryClient.invalidateQueries()
  }, [queryClient])

  useEffect(() => {
    window.addEventListener("beforeunload", reject)
    return () => window.removeEventListener("beforeunload", reject)
  }, [reject])

  if (!requested) return null

  const { url, favicon } = requested

  return (
    <ConfirmPage title="Connect with wallet">
      <Group bg="mono.6" p={20} sx={{ borderRadius: 12 }}>
        <Image src={favicon} width={32} height={32} />
        <Text fw={600}>{url}</Text>
      </Group>

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

export default ConfirmPermission
