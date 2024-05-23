import { useEffect } from "react"
import { Button, Group } from "@mantine/core"
import FixedBottom from "../../components/FixedBottom"

interface Props {
  reject: () => void
  isLoading?: boolean
  disabled?: boolean
}

const ConfirmTxActions = ({ reject, isLoading, disabled }: Props) => {
  useEffect(() => {
    window.addEventListener("beforeunload", reject)
    return () => window.removeEventListener("beforeunload", reject)
  }, [reject])

  return (
    <FixedBottom>
      <Group grow>
        <Button type="button" variant="secondary" onClick={reject} disabled={isLoading}>
          Reject
        </Button>

        <Button type="submit" disabled={disabled} loading={isLoading} loaderProps={{ color: "mono.9" }}>
          Approve
        </Button>
      </Group>
    </FixedBottom>
  )
}

export default ConfirmTxActions
