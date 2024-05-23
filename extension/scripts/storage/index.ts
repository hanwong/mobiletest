import BrowserStorage from "./browser"
import WindowStorage from "./window"

export default chrome.storage ? BrowserStorage : WindowStorage
