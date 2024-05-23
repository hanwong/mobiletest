import z from "zod"
import { useLocalStorage } from "@mantine/hooks"

export const CustomTokenSchema = z.object({
  key: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})

export type CustomToken = z.infer<typeof CustomTokenSchema>

function useCustomTokens(chainId: string) {
  const [customTokens, setCustomTokens] = useLocalStorage<{ [chainId: string]: CustomToken[] }>({
    key: "CustomTokens",
    defaultValue: {},
    getInitialValueInEffect: false,
  })

  const list = customTokens[chainId] || []

  function addItem(token: CustomToken) {
    if (list.find((item) => item.key === token.key)) throw new Error("Token already exists")
    setCustomTokens({ ...customTokens, [chainId]: [...list, token] })
  }

  function deleteItem(tokenKey: string) {
    setCustomTokens({ ...customTokens, [chainId]: list.filter((token) => token.key !== tokenKey) })
  }

  return { list, addItem, deleteItem }
}

export default useCustomTokens
