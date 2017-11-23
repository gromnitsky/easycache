'use strict';

/* globals chrome */

let cache_providers = require('./cacheproviders.mjs')
let cp = new cache_providers.CacheProviders()

let click = function(info, tab) {
    let provider = cp.get()[Number(info.menuItemId)]
    let new_tab = provider.new_tab
    let url = cp.url(provider.name, info.linkUrl)
    console.log(url, new_tab)

    if (new_tab) {
    	chrome.tabs.create({url})
    } else {
    	chrome.tabs.update(tab.tabId, {url})
    }
}

chrome.contextMenus.onClicked.addListener(click)

// the callback shouldn't run each time chrome wakes up the extension
chrome.runtime.onInstalled.addListener(() => {
    cache_providers.menu(cp)
})
