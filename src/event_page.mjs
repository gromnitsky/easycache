'use strict';

/* globals chrome */

let cache_providers = require('./cacheproviders.mjs')

let cp = new cache_providers.CacheProviders()

let click = function(info, _tab) {
    cp.update()
    let provider = cp.get()[Number(info.menuItemId)]
    cp.url(provider.name, info.linkUrl).then( url => {
	console.log(url)
	chrome.tabs.create({url})
    })
}

chrome.contextMenus.onClicked.addListener(click)

// the callback shouldn't run each time chrome wakes up the extension
chrome.runtime.onInstalled.addListener(() => {
    cache_providers.menu(cp)
})
