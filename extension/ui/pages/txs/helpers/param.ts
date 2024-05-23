import { useSearchParams } from "react-router-dom"

export function useSearchParam(key: string) {
  const [searchParams] = useSearchParams()
  return searchParams.get(key)
}

export function useDefinedSearchParam(key: string) {
  const value = useSearchParam(key)
  if (!value) throw new Error(`${key} not found`)
  return value
}
