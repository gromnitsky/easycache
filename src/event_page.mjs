'use strict';

/* globals chrome */

let cache_providers = require('./cacheproviders')

let cp = new cache_providers.CacheProviders()

let url = function(info) {
    if (info.selectionText) {
	let r; try {
	    r = new URL(info.selectionText)
	} catch (e) {
	    return null
	}
	return r.href
    }
    return info.linkUrl || info.srcUrl
}

let alert = function(tab, msg, retry) {
    chrome.tabs.sendMessage(tab.id, msg, res => {
	if (!res && !retry) {	// no script was injected yet
	    inject_content_script( () => {
		console.log('content script injected', tab.url)
		alert(tab, msg, true) // retry only once
	    })
	    return
	}
	// do nothing: the injected script should display an alert() dialog
    })
}

let inject_content_script = function(cb) {
    chrome.tabs.executeScript({
	file: 'content_script.js'
    }, () => cb())
}

let click = async function(info, tab) {
    let link = url(info); if (!link) {
	alert(tab, "Failed to extract the URL")
	return
    }

    cp.update()
    let provider = (await cp.get())[Number(info.menuItemId)]
    cp.url(provider.name, link).then( url => {
	console.log(url)
	chrome.tabs.create({url})
    }).catch( e => {
	alert(tab, `Failed to talk to ${provider.name}`)
	throw e
    })
}

chrome.contextMenus.onClicked.addListener(click)

// the callback shouldn't run each time chrome wakes up the extension
chrome.runtime.onInstalled.addListener(() => {
    cache_providers.menu(cp)
})
