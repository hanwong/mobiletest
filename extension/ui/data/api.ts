import type { InfiniteData } from "@tanstack/react-query"

export type PaginatedResponse<T> = {
  pagination?: {
    next_key: string | null
    total: string
  }
} & T

export function parsePaginatedResponse<T>(data: InfiniteData<PaginatedResponse<T>> | undefined, key: keyof T) {
  const list = data?.pages?.map((page) => page[key] ?? []).flat() ?? []
  const count = Number(data?.pages?.[0]?.pagination?.total) || 0
  return { list, count }
}
