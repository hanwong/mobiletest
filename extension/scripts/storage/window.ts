const WindowStorage = {
  get: <T>(key: string) => {
    const result = localStorage.getItem(key)
    return result ? (JSON.parse(result) as T) : undefined
  },
  set: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
}

export default WindowStorage
