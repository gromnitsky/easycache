import * as cache_providers from './cacheproviders.js'

let provider

// A race condition: while the popup is opening, we load the list of
// providers to set the global `provider` variable. The popup, after
// its DOMContentLoaded event, sends message to us to get the value of
// `provider` variable.
//
// Easily alleviated by moving `chrome.action.openPopup()` to the end
// of the function, but then firefox says 'openPopup requires a user
// gesture'.
async function click(info, _tab) {
    chrome.action.openPopup()
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    // this is a short-lived variable but it has enough lifespan for
    // the popup to read its value
    provider = {
        name: cp.get()[Number(info.menuItemId)].name,
        siteurl: info.selectionText || info.linkUrl || info.srcUrl
    }
}

function messages_from_popup(req, sender, res) {
    if (req?.provider) {
        res(provider)
        provider = null
    } else {
        console.error('unknown message from popup:', req)
    }
}

chrome.contextMenus.onClicked.addListener(click)
chrome.runtime.onMessage.addListener(messages_from_popup)

// the callback shouldn't run each time chrome wakes up the extension
chrome.runtime.onInstalled.addListener(async () => {
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    cache_providers.menu(cp)
})
