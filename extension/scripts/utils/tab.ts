function getOwnTabs() {
  if (typeof chrome.extension.getViews !== "function") return Promise.resolve([])
  const views = chrome.extension.getViews({ type: "tab" })
  return Promise.all(views.map((view) => view.chrome.tabs.getCurrent()))
}

export async function openTab(path = "") {
  const index = chrome.runtime.getURL("index.html")
  const url = path ? [index, path].join("#") : index
  const [tab] = await getOwnTabs()
  if (tab?.id) await chrome.tabs.update(tab.id, { url, active: true })
  else await chrome.tabs.create({ url, active: true })
}
