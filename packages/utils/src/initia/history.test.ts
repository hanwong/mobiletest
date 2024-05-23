import { accumulateChanges, calcChangesFromEvents, parseMoveAttributes } from "./history"
import EVENTS from "./history.sample.json"

test("parseMoveAttributes", () => {
  const input = [
    { key: "type_metadata", value: "withdraw" },
    { key: "data", value: '{"coin":"offerCoin"}' },
  ]

  const output = { type_metadata: "withdraw", data: '{"coin":"offerCoin"}' }

  expect(parseMoveAttributes(input)).toEqual(output)
})

test("accumulateChanges", () => {
  const input = [
    { amount: "-1", metadata: "0xETH" },
    { amount: "1600", metadata: "0xINIT" },
    { amount: "-1", metadata: "0xETH" },
    { amount: "1600", metadata: "0xINIT" },
    { amount: "1", metadata: "0xOSMO" },
    { amount: "1", metadata: "0xOSMO" },
    { amount: "1", metadata: "0xAPT" },
    { amount: "-1", metadata: "0xAPT" },
  ]

  const output = [
    { amount: "-2", metadata: "0xETH" },
    { amount: "3200", metadata: "0xINIT" },
    { amount: "2", metadata: "0xOSMO" },
  ]

  expect(accumulateChanges(input)).toEqual(output)
})

test.skip("getChangesFromEvents", () => {
  const input = EVENTS
  const output = [
    { amount: "-1000000", metadata: "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9" },
    { amount: "5864", metadata: "0xe3a97600010bb368be99d6f4ed231aca4dbba9b6340edf3c48dfbfd0474e92e8" },
  ]

  expect(calcChangesFromEvents(input, "init1gs9eytt8lauv6c83jsk7eakhxv30gftlskqz3d")).toEqual(output)
})
