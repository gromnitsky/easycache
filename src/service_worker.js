import * as cache_providers from './cacheproviders.js'

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function is_firefox() { return navigator.userAgent.indexOf('Firefox') !== -1 }

async function click(info, _tab) {
    await chrome.action.openPopup()
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    let provider = {
        name: cp.get()[Number(info.menuItemId)].name,
        siteurl: info.selectionText || info.linkUrl || info.srcUrl
    }
    // tell popup.html about user choice
    if (is_firefox()) await sleep(100) // oh my days
    chrome.runtime.sendMessage(provider)
}

chrome.contextMenus.onClicked.addListener(click)

// the callback shouldn't run each time chrome wakes up the extension
chrome.runtime.onInstalled.addListener(async () => {
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    cache_providers.menu(cp)
})
