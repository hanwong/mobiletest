const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3)
chrome.runtime.onStartup.addListener(keepAlive)
keepAlive()
