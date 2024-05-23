import { encode, decode } from "@initia/utils"
import type { RequestMethod } from "./types"
import { PORT, TYPE } from "./shared/constants"
import getId from "./utils/getId"
import log from "./utils/log"

let port: chrome.runtime.Port | null = null

const connect = () => {
  try {
    port = chrome.runtime.connect({ name: PORT.INTERNAL })
  } catch {
    //
  }

  port?.onMessage.addListener((message) => {
    if (message.type !== TYPE.EVENT) return
    log.event("event: " + message.event)
    window.dispatchEvent(new Event(message.event))
  })

  port?.onDisconnect.addListener(() => {
    port = null
    connect()
  })
}

connect()

export const request: RequestMethod = (method, args) => {
  const id = getId()
  const info = [id, method].join(" ")

  log.request("request: " + info)

  return new Promise((resolve, reject) => {
    function receiveResponse(data: { id: string; type: string; response: string; error: string }) {
      if (!(data.id === id)) return
      if (!(data.type === TYPE.RESPONSE || data.type === TYPE.ERROR)) return

      port?.onMessage.removeListener(receiveResponse)

      if (data.error) {
        log.failure("error: " + info)
        reject(new Error(data.error))
      } else {
        log.success("response: " + info)
        resolve(decode(data.response))
      }
    }

    port?.onMessage.addListener(receiveResponse)
    port?.postMessage({ type: TYPE.REQUEST, id, method, args: encode(args) })
  })
}
