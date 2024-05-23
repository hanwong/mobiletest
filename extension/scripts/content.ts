import { PORT, TYPE } from "./shared/constants"

let port: chrome.runtime.Port | null = null

const connect = () => {
  try {
    port = chrome.runtime.connect({ name: PORT.EXTERNAL })
  } catch {
    //
  }

  port?.onMessage.addListener((message) => {
    if (message.type === TYPE.EVENT) window.dispatchEvent(new Event(message.event))
    if (message.type === TYPE.RESPONSE || message.type === TYPE.ERROR) window.postMessage(message, "*")
  })

  port?.onDisconnect.addListener(() => {
    port = null
    connect()
  })
}

connect()

window.addEventListener("message", ({ source, data }) => {
  if (source !== window) return
  if (data.type === TYPE.REQUEST) port?.postMessage(data)
})

function inject() {
  const container = document.head || document.documentElement
  const script = document.createElement("script")
  script.setAttribute("src", chrome.runtime.getURL("page.js"))
  container.prepend(script)
  script.remove()
}

inject()
