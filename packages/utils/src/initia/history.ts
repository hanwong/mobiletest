import { filter, groupBy, map, pipe, prop, values } from "ramda"
import BigNumber from "bignumber.js"
import type { Event } from "@cosmjs/stargate/build/events"
import type { Attribute } from "@cosmjs/stargate/build/events"
import { AddressUtils } from "./address"
import { primaryCoinStore } from "./metadata"

export function parseMoveAttributes(attributes: readonly Attribute[]) {
  return Object.fromEntries(attributes.map(({ key, value }) => [key, value]))
}

interface Change {
  amount: string
  metadata: string
}

export const accumulateChanges: (changes: Change[]) => Change[] = pipe(
  groupBy(prop("metadata")),
  values,
  map((changes = []) => {
    const { metadata } = changes[0]
    const amount = BigNumber.sum(...map(prop("amount"), changes)).toString()
    return { amount, metadata }
  }),
  filter<Change>(({ amount }) => !BigNumber(amount).isZero()),
)

export function calcChangesFromEvents(events: Event[], address: string) {
  try {
    const parsedMoveAttributes = events
      .filter(({ type }) => type === "move")
      .map(({ attributes }) => parseMoveAttributes(attributes))

    const change = parsedMoveAttributes.reduce((acc, { type_tag, data }) => {
      try {
        const { amount, store_addr, metadata_addr } = JSON.parse(data)

        if ("0x" + primaryCoinStore(AddressUtils.toPrefixedHex(address), metadata_addr) !== store_addr) {
          return acc
        }

        if (type_tag === "0x1::fungible_asset::DepositEvent") {
          return [...acc, { amount: BigNumber(amount).toString(), metadata: metadata_addr }]
        }

        if (type_tag === "0x1::fungible_asset::WithdrawEvent") {
          return [...acc, { amount: BigNumber(amount).negated().toString(), metadata: metadata_addr }]
        }

        return acc
      } catch {
        return acc
      }
    }, [] as Change[])

    return accumulateChanges(change)
  } catch {
    return accumulateChanges([])
  }
}
