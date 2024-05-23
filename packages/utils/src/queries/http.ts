export default function createHTTPClient(baseURL: string) {
  async function get<T = any>(path: string, params = {}): Promise<T> {
    const url = new URL(path, baseURL)
    const searchParams = new URLSearchParams(params)
    url.search = searchParams.toString()
    const response = await fetch(url)
    return response.json()
  }

  async function getAll<T, U>(
    path: string,
    params = {},
    getNextPageParams: (response: T) => object | null,
    getItems: (response: T) => U[],
    acc: U[] = [],
  ): Promise<U[]> {
    const response = await get<T>(path, params)
    const items = [...acc, ...getItems(response)]
    const nextPageParams = getNextPageParams(response)
    if (!nextPageParams) return items
    return getAll(path, { ...params, ...nextPageParams }, getNextPageParams, getItems, items)
  }

  async function post<T>(path: string, payload: object): Promise<T> {
    const url = new URL(path, baseURL)
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    return response.json()
  }

  return {
    get,
    getAll,
    post,
  }
}
