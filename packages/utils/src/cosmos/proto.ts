import type { GeneratedType } from "@cosmjs/proto-signing"
import { Registry } from "@cosmjs/proto-signing"
import { defaultRegistryTypes } from "@cosmjs/stargate"
import messages from "./messages"

export const initiaRegistryTypes: ReadonlyArray<[string, GeneratedType]> = Object.entries(messages)
  .filter(([, { msg }]) => msg)
  .map(([typeUrl, { msg }]) => [typeUrl, msg!])

export const registryTypes = [...defaultRegistryTypes, ...initiaRegistryTypes]

export function createRegistry(): Registry {
  return new Registry(registryTypes)
}
