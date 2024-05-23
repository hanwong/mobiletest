import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { EVENT } from "../scripts/shared/constants"
import { getIsPopup } from "../scripts/utils/popup"
import { request } from "../scripts/ui"

export { request }

// (IMPORTANT) `queryKey` should starts with "background" to avoid being persisted.

/* vault */
export function useInitialized() {
  const { data } = useQuery({
    queryKey: ["background", "initialized"],
    queryFn: () => request("getInitialized"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

/* locked */
export function useLocked() {
  const { data } = useQuery({
    queryKey: ["background", "locked"],
    queryFn: () => request("getLocked"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

/* accounts */
export function useAccounts() {
  const { data = [] } = useQuery({
    queryKey: ["background", "accounts"],
    queryFn: () => request("getAccounts"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useAccount() {
  const { data } = useQuery({
    queryKey: ["background", "account"],
    queryFn: async () => (await request("getAccount")) ?? null,
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useAccountName() {
  const account = useAccount()
  return account?.name ?? ""
}

export function useInitiaAddress() {
  const { data = "" } = useQuery({
    queryKey: ["background", "initiaAddress"],
    queryFn: () => request("getInitiaAddress"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useAddress() {
  const { data = "" } = useQuery({
    queryKey: ["background", "currentChainAddress"],
    queryFn: () => request("getCurrentChainAddress"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

/* layers */
export function useInitLayers() {
  const { data = [] } = useQuery({
    queryKey: ["background", "layers"],
    queryFn: async () => request("initLayers"),
    suspense: true,
  })
  return data
}

export function useLayers() {
  const { data = [] } = useQuery({
    queryKey: ["background", "layers"],
    queryFn: async () => request("getLayers"),
    suspense: true,
  })
  return data
}

export function useRegisteredLayers() {
  const { data = [] } = useQuery({
    queryKey: ["background", "registeredLayers"],
    queryFn: async () => request("getRegisteredLayers"),
    suspense: true,
  })
  return data
}

export function useCustomLayers() {
  const { data = [] } = useQuery({
    queryKey: ["background", "customLayers"],
    queryFn: async () => request("getCustomLayers"),
    suspense: true,
  })
  return data
}

export function useFindLayer(chainId: string) {
  const layers = useLayers()
  return layers.find((layer) => layer.chain_id === chainId)
}

export function useDefinedLayer(chainId: string) {
  const layer = useFindLayer(chainId)
  if (!layer) throw new Error(`Layer not found: ${chainId}`)
  return layer
}

export function useDefinedLayer1() {
  const layers = useLayers()
  const layer = layers.find((layer) => layer.metadata?.is_l1)
  if (!layer) throw new Error("Layer 1 not found")
  return layer
}

/* requested */
export function useRequestedPermission() {
  const { data } = useQuery({
    queryKey: ["background", "requestedPermission"],
    queryFn: async () => (await request("getRequestedPermission")) ?? null,
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useRequestedLayer() {
  const { data } = useQuery({
    queryKey: ["background", "requestedLayer"],
    queryFn: async () => (await request("getRequestedLayer")) ?? null,
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useRequestedSignDoc() {
  const { data } = useQuery({
    queryKey: ["background", "requestedSignDoc"],
    queryFn: async () => (await request("getRequestedSignDoc")) ?? null,
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useRequestedTx() {
  const { data } = useQuery({
    queryKey: ["background", "requestedTx"],
    queryFn: async () => (await request("getRequestedTx")) ?? null,
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useRequestedArbitrary() {
  const { data } = useQuery({
    queryKey: ["background", "requestedArbitrary"],
    queryFn: async () => (await request("getRequestedArbitrary")) ?? null,
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

export function useAuthorizedPermission() {
  const { data = [] } = useQuery({
    queryKey: ["background", "authorizedPermission"],
    queryFn: () => request("getAuthorizedPermission"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

/* preferences */
export function usePreferences() {
  const { data = {} } = useQuery({
    queryKey: ["background", "preferences"],
    queryFn: () => request("getPreferences"),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}

/* event */
export function useSubscribe() {
  const queryClient = useQueryClient()

  useEffect(() => {
    window.addEventListener(EVENT.LOCKED, async () => await queryClient.invalidateQueries())
    window.addEventListener(EVENT.ADDRESS, async () => await queryClient.invalidateQueries())
    window.addEventListener(EVENT.CHAIN, async () => await queryClient.invalidateQueries())
  }, [queryClient])
}

/* chrome */
export function useIsPopup() {
  const { data = false } = useQuery({
    queryKey: ["background", "isPopup"],
    queryFn: () => getIsPopup(),
    suspense: true,
    staleTime: Infinity,
  })
  return data
}
