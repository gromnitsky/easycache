'use strict';

let cache_providers = require('./cacheproviders.mjs')

let render = function(css_query, cp, url) {
    let li = function(item) {
	if (item.separator) return '<li><hr></li>'
	return `<li><a target='_blank' href="${cp.url(item.name, url)}">${item.name}</a></li>`
    }
    document.querySelector(css_query).innerHTML = cp.get().map(li).join("\n")
}

/* globals chrome */
let main = function main() {
    // get current tab url
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
	let cp = new cache_providers.CacheProviders()
	render('ul', cp, tabs[0].url)
    })
}

document.addEventListener('DOMContentLoaded', main)
