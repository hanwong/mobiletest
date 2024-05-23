export type Paginated<T = unknown> = T & { pagination: { next_key: string | null } }
export const getNextPageParams = ({ pagination }: Paginated) =>
  pagination.next_key ? { "pagination.key": pagination.next_key } : null
