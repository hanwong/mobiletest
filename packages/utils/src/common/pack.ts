import * as msgpack from "@msgpack/msgpack"

export function encode(input: unknown) {
  return Buffer.from(msgpack.encode(input, { useBigInt64: true })).toString("base64")
}

export function decode<T>(input: string) {
  return msgpack.decode(Buffer.from(input, "base64"), { useBigInt64: true }) as T
}
