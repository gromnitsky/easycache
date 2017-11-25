'use strict';

/* globals chrome */

let cache_providers = require('./cacheproviders.mjs')

let spinner = function() {
    let node = document.querySelector('#warning')
    node.style.display = /^(none)?$/.test(node.style.display) ? 'flex' : 'none'
}

let render = function(css_query, cp, siteurl) {
    let li = function(item) {
	if (item.separator) return '<li><hr></li>'
	return `<li><a target='_blank' href="#">${cache_providers.escape_input(item.name)}</a></li>`
    }
    let doc = document.querySelector(css_query)
    doc.innerHTML = cp.get().map(li).join("\n")

    doc.querySelectorAll('a').forEach( link => {
	link.onclick = (evt) => {
	    evt.preventDefault()
	    spinner()

	    let name = link.innerText
	    cp.url(name, siteurl).then( url => {
		spinner()
		console.log(url)
		chrome.tabs.create({url})
	    }).catch(e => {
		alert(`Failed to talk to ${name}`)
		spinner()
		throw e
	    })
	}
    })
}

let main = function main() {
    // get current tab url
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
	let cp = new cache_providers.CacheProviders()
	render('ul', cp, tabs[0].url)
    })
}

document.addEventListener('DOMContentLoaded', main)
