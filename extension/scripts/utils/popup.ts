import { EXTENSION_WIDTH } from "../shared/constants"

let windowId: number | undefined

export async function openPopup() {
  if (windowId) {
    await closePopup()
  }

  const { top = 0, left = 0, width = 0 } = await chrome.windows.getLastFocused()

  const data: chrome.windows.CreateData = {
    top: top,
    left: left + (width - EXTENSION_WIDTH),
    width: EXTENSION_WIDTH,
    height: 600,
    type: "popup",
    url: chrome.runtime.getURL("index.html"),
  }

  const window = await chrome.windows.create(data)
  windowId = window?.id
}

export async function closePopup() {
  if (!windowId) return

  try {
    await chrome.windows.remove(windowId)
  } catch {
    // ignore
  }

  windowId = undefined
}

export async function getIsPopup() {
  if (!chrome.tabs) return false
  const tab = await chrome.tabs.getCurrent()
  return !tab
}
