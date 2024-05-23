import { AddressUtils } from "../../initia/address"
import bcs from "../../initia/bcs"
import createInitiaMoveClient from "../move/Move"

function createInitiaUsernamesClient(rest: string, moduleAddress: string) {
  const client = createInitiaMoveClient(rest)

  const moduleName = "usernames"

  async function getUsername(address: string) {
    const arg = bcs.address().serialize(address).toBase64()
    const name = await client.view<string>({
      moduleAddress,
      moduleName,
      functionName: "get_name_from_address",
      type_args: [],
      args: [arg],
    })

    if (!name) return null
    return name + ".init"
  }

  async function getAddress(username: string) {
    const arg = bcs.string().serialize(username.replace(".init", "")).toBase64()
    const address = await client.view<string>({
      moduleAddress,
      moduleName,
      functionName: "get_address_from_name",
      type_args: [],
      args: [arg],
    })

    if (!address) return null
    return AddressUtils.toBech32(address)
  }

  return {
    rest,
    getUsername,
    getAddress,
  }
}

export default createInitiaUsernamesClient
