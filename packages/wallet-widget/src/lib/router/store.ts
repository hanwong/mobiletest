import { writable } from "svelte/store"

interface Route {
  path: string
  state?: unknown
}

interface RouterState {
  current: Route
  history: Route[]
}

const initialState: RouterState = {
  current: { path: "/" },
  history: [{ path: "/" }],
}

const createRouterStore = () => {
  const { subscribe, update } = writable<RouterState>(initialState)

  return {
    subscribe,
    navigate: (path: string, state?: unknown) => {
      update((prev) => {
        const route = { path, state }
        return { ...prev, current: route, history: [...prev.history, route] }
      })
    },
    goBack: () => {
      update((prev) => {
        if (prev.history.length > 1) {
          const history = prev.history.slice(0, -1)
          return { ...prev, current: history[history.length - 1], history }
        }
        return prev
      })
    },
  }
}

export const router = createRouterStore()
