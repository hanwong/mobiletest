import { get } from "svelte/store"
import { router } from "./store"

export const navigate = router.navigate
export const goBack = router.goBack

export function getState<T = unknown>(): T | undefined {
  const currentRoute = get(router).current
  return currentRoute.state as T
}
