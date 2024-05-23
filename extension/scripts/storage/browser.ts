const BrowserStorage = {
  get: async <T>(key: string) => {
    const { [key]: result } = await chrome.storage.local.get(key)
    return result as T | undefined
  },
  set: async (key: string, value: unknown) => {
    await chrome.storage.local.set({ [key]: value })
  },
}

export default BrowserStorage
