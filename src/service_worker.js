import * as cache_providers from './cacheproviders.js'

let url = function(info) {
    try {
	return new URL(info.selectionText || info.linkUrl || info.srcUrl).href
    } catch (_) {
	return null
    }
}

let msg_send = function(tab, type, value, retry) {
    chrome.tabs.sendMessage(tab.id, {type, value}, res => {
	if (!res && !retry) {	// no script was injected yet
	    inject_content_script(tab, () => {
		console.log('content script injected', tab.url)
		msg_send(tab, type, value, true) // retry only once
	    })
	    return
	}
	// do nothing: the injected script should do its job & respond w/ 'true'
    })
}

function inject_content_script(tab, cb) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content_script.js']
    }, () => cb())
}

function click(cp, info, tab) {
    let link = url(info); if (!link) {
        return msg_send(tab, 'alert', "Failed to extract the URL")
    }

    let provider = cp.get()[Number(info.menuItemId)]
    cp.url(provider.name, link).then( url => {
        console.log(url)
        chrome.tabs.create({url})
    })
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    click(cp, info, tab)
})

// the callback shouldn't run each time chrome wakes up the extension
chrome.runtime.onInstalled.addListener(async () => {
    let cp = new cache_providers.CacheProviders()
    await cp.load()
    cache_providers.menu(cp, true)
})
