import type { DehydrateOptions } from "@tanstack/react-query"
import { QueryClient } from "@tanstack/react-query"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000, // 1 second
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
    mutations: {
      retry: false,
    },
  },
})

export const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

export const dehydrateOptions: DehydrateOptions = {
  shouldDehydrateQuery: ({ queryKey: [key], state: { status } }) => key !== "background" && status === "success",
  shouldDehydrateMutation: () => false,
}

export const buster = chrome.runtime?.getManifest().version
