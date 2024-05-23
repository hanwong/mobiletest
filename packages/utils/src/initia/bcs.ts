import BigNumber from "bignumber.js"
import type { BcsType, BcsTypeOptions } from "@mysten/bcs"
import { bcs } from "@mysten/bcs"
import { decodeAddress } from "./address"

type BCS = typeof bcs

interface InitiaBCS extends BCS {
  address: typeof addressSerializer
  object: typeof addressSerializer
  fixedPoint32: ReturnType<typeof createFixedPointSerializer>
  fixedPoint64: ReturnType<typeof createFixedPointSerializer>
  decimal128: ReturnType<typeof createFixedPointSerializer>
  decimal256: ReturnType<typeof createFixedPointSerializer>
}

const SCALE_FACTOR_FIXED_POINT_32 = new BigNumber("4294967296") // 2^32
const SCALE_FACTOR_FIXED_POINT_64 = new BigNumber("18446744073709551616") // 2^64
const SCALE_FACTOR_DECIMAL_128 = new BigNumber("1000000000000000000") // 10^18
const SCALE_FACTOR_DECIMAL_256 = SCALE_FACTOR_DECIMAL_128

function createFixedPointSerializer(
  scaleFactor: BigNumber,
  bcsType: (options?: BcsTypeOptions<string, number | bigint | string>) => BcsType<string, string | number | bigint>,
) {
  return (options?: BcsTypeOptions<string, string | number | bigint>) =>
    bcsType(options).transform({
      input: (val: number | string) => new BigNumber(val).times(scaleFactor).toFixed(0, BigNumber.ROUND_DOWN),
      output: (val: string) => new BigNumber(val).div(scaleFactor).toNumber(),
    })
}

const addressSerializer = (options?: BcsTypeOptions<Uint8Array, Iterable<number>>) => {
  return bcs.bytes(32, options).transform({
    input: (address: string) => decodeAddress(address, 32),
    output: (hexString: Uint8Array) => "0x" + Buffer.from(hexString).toString("hex"),
  })
}

const initiaBCS: InitiaBCS = {
  ...bcs,
  address: addressSerializer,
  object: addressSerializer,
  fixedPoint32: createFixedPointSerializer(SCALE_FACTOR_FIXED_POINT_32, bcs.u64),
  fixedPoint64: createFixedPointSerializer(SCALE_FACTOR_FIXED_POINT_64, bcs.u128),
  decimal128: createFixedPointSerializer(SCALE_FACTOR_DECIMAL_128, bcs.u128),
  decimal256: createFixedPointSerializer(SCALE_FACTOR_DECIMAL_256, bcs.u256),
}

export default initiaBCS
