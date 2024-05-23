import sortAssets from "./sortAssets"

const assets = [
  { denom: "move/btc", amount: "0" },
  { denom: "move/eth", amount: "0" },
  { denom: "uinit", amount: "0" },
  { denom: "move/link", amount: "0" },
  { denom: "move/dot", amount: "0" },
  { denom: "move/bnb", amount: "0" },
  { denom: "move/ada", amount: "0" },
]

const feeTokens = ["move/eth"]
const pairs = ["move/btc", "move/bnb"]

const output = [
  { denom: "uinit", amount: "0" },
  { denom: "move/eth", amount: "0" },
  { denom: "move/link", amount: "0" },
  { denom: "move/dot", amount: "0" },
  { denom: "move/ada", amount: "0" },
  { denom: "move/btc", amount: "0" },
  { denom: "move/bnb", amount: "0" },
]

test("sortAssets", () => {
  expect(sortAssets(assets, feeTokens, pairs)).toEqual(output)
})
