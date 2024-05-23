import { sort } from "ramda"
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin"

const sortAssets = (assets: readonly Coin[], feeDenoms: string[] = [], pairDenoms: string[] = []) => {
  const getOrder = (asset: Coin) => {
    if (asset.denom === "uinit") return 0
    if (feeDenoms.includes(asset.denom)) return 1
    if (pairDenoms.includes(asset.denom)) return 3
    return 2
  }

  const compare = (a: Coin, b: Coin) => {
    const orderA = getOrder(a)
    const orderB = getOrder(b)
    if (orderA !== orderB) return orderA - orderB
    return 0
  }

  return sort(compare, assets)
}

export default sortAssets
