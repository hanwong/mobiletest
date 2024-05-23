import axios from "axios"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { ChainSchema } from "@initia/initia-registry-types/zod"

export function validateUrl(value: string) {
  return z.string().url().safeParse(value).success
}

export function validateChainJson(value: string) {
  try {
    ChainSchema.parse(JSON.parse(value))
    return true
  } catch {
    return false
  }
}

export default function useQueryChainJson(url: string) {
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const { data } = await axios.get(url)

      if (!ChainSchema.safeParse(data).success) {
        throw new Error("Chain schema is invalid")
      }

      if (data.metadata?.is_l1) {
        throw new Error("Layer 1 already exists")
      }

      return data
    },
    enabled: validateUrl(url),
  })
}
