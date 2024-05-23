export * from "./tx"
export * from "./utils"
export * from "./validate"

export * from "./send"
export * from "./swap"
export * from "./routeSwap"

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
