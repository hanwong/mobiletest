import { useQuery } from "@tanstack/react-query"
import { AddressUtils } from "@initia/utils"
import { createInitiaUsernamesClient, isUsernameValid } from "@initia/utils"
import { defaultChain } from "../../scripts/shared/chains"

export function useUsernameFromAddress(address?: string) {
  const chain = defaultChain
  const { rest, modules } = chain

  return useQuery({
    queryKey: [rest, address, "Username"],
    queryFn: () => {
      if (!address) return null
      if (!AddressUtils.isValid(address, "init")) return null
      if (!modules.usernames) return null
      const client = createInitiaUsernamesClient(rest, modules.usernames)
      return client.getUsername(address)
    },
    // stale time should be not `Infinity` because the username can be changed
  })
}

export function useAddressFromUsername(username?: string) {
  const chain = defaultChain
  const { rest, modules } = chain

  return useQuery({
    queryKey: [rest, username, "Address"],
    queryFn: () => {
      if (!isUsernameValid(username)) return null
      if (!modules.usernames) return null
      const client = createInitiaUsernamesClient(rest, modules.usernames)
      return client.getAddress(username)
    },
    staleTime: Infinity,
  })
}
