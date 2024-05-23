import type { Chain } from "@initia/initia-registry-types"
import { encode, decode } from "@initia/utils"
import manifest from "../public/manifest.json"
import { TYPE } from "./shared/constants"
import type { RequestMethod } from "./types"
import getId from "./utils/getId"
import OfflineSigner from "./cosmos/OfflineSigner"

export const request: RequestMethod = (method, args) => {
  const id = getId()
  return new Promise((resolve, reject) => {
    function receiveResponse({ source, data }: MessageEvent) {
      if (!(source === window)) return
      if (!(data.id === id)) return
      if (!(data.type === TYPE.RESPONSE || data.type === TYPE.ERROR)) return
      window.removeEventListener("message", receiveResponse)
      if (data.error) reject(new Error(data.error))
      else resolve(decode(data.response))
    }

    window.addEventListener("message", receiveResponse)
    window.postMessage({ type: TYPE.REQUEST, id, method, args: encode(args) }, "*")
  })
}

const initia = {
  getVersion: async () => manifest.version,
  getAddress: (chainId: string) => request("requestAddress", chainId),
  signAndBroadcastSync: (chainId: string, txBody: Uint8Array) =>
    request("requestSignAndBroadcastSync", { chainId, txBody }),
  signAndBroadcastBlock: (chainId: string, txBody: Uint8Array) =>
    request("requestSignAndBroadcastBlock", { chainId, txBody }),
  signAndBroadcast: (chainId: string, txBody: Uint8Array) => request("requestSignAndBroadcast", { chainId, txBody }),
  getOfflineSigner: (chainId: string) => new OfflineSigner(chainId),
  requestAddInitiaLayer: (layer: Chain) => request("requestAddInitiaLayer", layer),
  signArbitrary: (data: string | Uint8Array) => request("requestSignArbitrary", data),
  verifyArbitrary: (data: string | Uint8Array, sig: string) => request("requestVerifyArbitrary", { data, sig }),
}

// @ts-ignore
window.initia = initia
