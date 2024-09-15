import * as cache_providers from './cacheproviders.js'

let provider

async function click(info, _tab) {
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    // this is a short-lived variable but it has enough lifespan for
    // the popup to read its value
    provider = {
        name: cp.get()[Number(info.menuItemId)].name,
        siteurl: info.selectionText || info.linkUrl || info.srcUrl
    }
    chrome.action.openPopup()
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
