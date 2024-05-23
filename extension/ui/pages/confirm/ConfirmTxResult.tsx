import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Center, Stack, Text, Title, useMantineTheme } from "@mantine/core"
import type { Chain } from "@initia/initia-registry-types"
import Icon from "../../styles/Icon"
import FixedBottom from "../../components/FixedBottom"
import ExplorerLink from "../../components/ExplorerLink"

interface Props {
  txhash?: string
  error?: string
  onOk?: () => void
  layer?: Chain
}

const ConfirmTxResult = ({ txhash, error, onOk, layer }: Props) => {
  const navigate = useNavigate()
  const { fn } = useMantineTheme()
  const danger = fn.themeColor("danger")
  const status = txhash ? "Success" : error ? "Failure" : "Broadcasting"

  const queryClient = useQueryClient()
  const handleOk = async () => {
    if (onOk) onOk()
    else navigate("/")
    await queryClient.invalidateQueries()
  }

  const icon = useMemo(() => {
    switch (status) {
      case "Success":
        return <Icon.CheckCircleFilled width={50} height={50} />

      case "Failure":
        return (
          <Text c="danger">
            <Icon.CloseCircleFilled width={50} height={50} fill={danger} />
          </Text>
        )

      default:
        return null
    }
  }, [status, danger])

  return (
    <Stack spacing={12} py={200}>
      <Center>{icon}</Center>

      <Stack spacing={8}>
        <Title fz={24} fw={800} ta="center">
          {status}
        </Title>

        <Text fz={14} fw={700}>
          {txhash && (
            <Center>
              <ExplorerLink value={txhash} tx layer={layer}>
                View on Explorer
              </ExplorerLink>
            </Center>
          )}

          {error && (
            <Center px={20} sx={{ overflowWrap: "break-word", wordBreak: "break-word" }}>
              <Text c="danger">{error}</Text>
            </Center>
          )}
        </Text>
      </Stack>

      {!!(txhash || error) && (
        <FixedBottom>
          <Button onClick={handleOk}>Ok</Button>
        </FixedBottom>
      )}
    </Stack>
  )
}

export default ConfirmTxResult
