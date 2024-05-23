export default class AsyncLocalStorage {
  static async getItem<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      const item = localStorage.getItem(key)
      if (item) {
        resolve(JSON.parse(item) as T)
      } else {
        resolve(null)
      }
    })
  }

  static async setItem(key: string, value: any): Promise<void> {
    return new Promise((resolve) => {
      localStorage.setItem(key, JSON.stringify(value))
      resolve()
    })
  }

  static async removeItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem(key)
      resolve()
    })
  }
}
