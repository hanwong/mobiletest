import BigNumber from "bignumber.js"
import { intlFormatDistance } from "date-fns"
import { Box, Group, Stack, Text } from "@mantine/core"
import { calcChangesFromEvents, registryTypes, summarizeMessage, truncate } from "@initia/utils"
import { ErrorBoundary } from "@initia/react-components"
import { useAddress } from "../../background"
import Icon from "../../styles/Icon"
import Num from "../../components/Num"
import WithTokenInfo from "../../components/WithTokenInfo"
import ExplorerLink from "../../components/ExplorerLink"
import LayerTokenInfo from "../../components/LayerTokenInfo"
import { useActivityLayer } from "./activity-state"
import type { TxItem } from "./Activity.types"
import useStyles from "./Activity.styles"

const ActivityMessages = ({ tx }: TxItem) => {
  const { classes } = useStyles()

  return (
    <Stack spacing={2}>
      {tx.body.messages
        .map((msg) => {
          const typeUrl = msg["@type"]
          // @ts-expect-error // The data received from API is not a valid protobuf message
          const value = new Map(registryTypes).get(typeUrl)?.fromJSON(camelcaseKeys(msg))
          return summarizeMessage({ typeUrl, value })
        })
        .map(([title, subtitle], index) => (
          <Text className={classes.message} key={index}>
            {title}
            {subtitle && (
              <Text span c="mono.3" fz={12}>
                {` (${truncate(subtitle)})`}
              </Text>
            )}
          </Text>
        ))}
    </Stack>
  )
}

function camelcaseKeys(input: Record<string, unknown>) {
  const output: Record<string, unknown> = {}

  for (const key in input) {
    const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    output[camelCaseKey] = input[key]
  }

  return output
}

const ActivityChanges = ({ events }: TxItem) => {
  const { classes } = useStyles()
  const address = useAddress()
  const changes = calcChangesFromEvents(events, address)
  const layer = useActivityLayer()

  return (
    <>
      {changes.map(({ amount, metadata }, index) => (
        <Text className={classes.change} key={index}>
          <WithTokenInfo layer={layer} metadata={metadata}>
            {({ denom }) => (
              <LayerTokenInfo layer={layer} denom={denom}>
                {({ symbol, decimals }) => (
                  <Num
                    amount={BigNumber(amount).abs().toString()}
                    symbol={symbol}
                    decimals={decimals}
                    prefix={BigNumber(amount).isPositive() ? "+" : "-"}
                    c={BigNumber(amount).isPositive() ? "success" : "danger"}
                    decimalSize={10}
                  />
                )}
              </LayerTokenInfo>
            )}
          </WithTokenInfo>
        </Text>
      ))}
    </>
  )
}

const ActivityTimestamp = ({ code, timestamp }: TxItem) => {
  const { classes } = useStyles()

  return (
    <Group className={classes.timestamp}>
      <Group spacing={6}>
        <Text>{intlFormatDistance(new Date(timestamp), new Date())}</Text>
      </Group>

      {!!code && (
        <Text c="danger" fz={10}>
          <Group spacing={4}>
            <Icon.Warning width={12} height={12} />
            Failed
          </Group>
        </Text>
      )}
    </Group>
  )
}

const ActivityItem = (props: TxItem) => {
  const { classes } = useStyles()
  const layer = useActivityLayer()

  return (
    <Box component={ExplorerLink} value={props.txhash} layer={layer} tx className={classes.root}>
      <Box className={classes.inner}>
        <ActivityTimestamp {...props} />

        <Group spacing={8}>
          <Box className={classes.messages}>
            <ErrorBoundary fallback={() => truncate(props.txhash)}>
              <ActivityMessages {...props} />
            </ErrorBoundary>
          </Box>

          <Box className={classes.changes}>
            <ErrorBoundary fallback={() => null}>
              <ActivityChanges {...props} />
            </ErrorBoundary>
          </Box>
        </Group>
      </Box>
    </Box>
  )
}

export default ActivityItem
