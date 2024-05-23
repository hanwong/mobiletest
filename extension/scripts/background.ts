import type { BehaviorSubject } from "rxjs"
import { encode, decode } from "@initia/utils"
import { EVENT, PORT, TYPE } from "./shared/constants"
import { openTab } from "./utils/tab"
import log from "./utils/log"
import internal from "./handlers/internal"
import external from "./handlers/external"
import { selectedInitiaAddress, locked } from "./data/subjects"
import "./keep-alive"

chrome.runtime.onConnect.addListener(async (port) => {
  if (!Object.values(PORT).includes(port.name)) return
  if (!port.sender?.url) return
  const { origin: url, protocol } = new URL(port.sender.url)
  const favicon = port.sender.tab?.favIconUrl
  const isInternal = url === `chrome-extension://${chrome.runtime.id}`
  if (!(protocol === "http:" || protocol === "https:" || isInternal)) return

  function subscribe<T>(name: string, subject: BehaviorSubject<T>) {
    const subscription = subject.subscribe(() => {
      const info = [isInternal ? "internal" : url, name]
      log.event(info.join(" ← "))
      port.postMessage({ type: TYPE.EVENT, event: name })
    })

    port.onDisconnect.addListener(() => subscription.unsubscribe())
  }

  subscribe(EVENT.LOCKED, locked)
  subscribe(EVENT.ADDRESS, selectedInitiaAddress)

  port.onMessage.addListener(async ({ id, method, args }) => {
    const info = [isInternal ? "internal" : url, `(${id}) ${method}`]

    try {
      log.request(info.join(" → "))
      const response = isInternal
        ? await internal(method, decode(args))
        : await external({ url, favicon })(method, decode(args))
      log.success(info.join(" ← "))
      port.postMessage({ type: TYPE.RESPONSE, id, response: encode(response) })
    } catch (error) {
      log.failure(info.join(" ✕ "))
      console.info(error)
      if (error instanceof Error) {
        port.postMessage({ type: TYPE.ERROR, id, error: error.message })
      }
    }
  })
})

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") openTab()
})
