'use strict';

class CacheProviders {
    get() {
	if (this._list) return this._list
	let saved = window.localStorage.getItem('cache_providers')
	this._list = saved ? JSON.parse(saved) : Object.assign([], CacheProviders.def)
	return this._list
    }

    almost_empty() {
	return this.get().filter(val => val.name).length === 1
    }

    add(obj) { return this.get().push(obj) }

    findIndex(name) {
	return this.get().findIndex( val => val.name && val.name === name)
    }

    // returns a promise
    url(name, siteurl = 'https://www.yahoo.com/') {
	let p = this.get()[this.findIndex(name)]
	let url = p.encode ? encodeURIComponent(siteurl) : siteurl
	if (p.tmpl) return Promise.resolve(p.tmpl.replace(/%s/, url))
	return CacheProviders.callbacks[p.cb](url)
    }

    is_sep(idx) { return this.get()[idx].separator }

    delete(idx) { this.get().splice(idx, 1) }

    reset() {
	window.localStorage.removeItem('cache_providers')
	this._list = null
    }

    update(data) { this._list = data }
}

CacheProviders.callbacks = {
    // retrieve the 1st cached result of the search;
    // works as of Sat Nov 25 07:00:14 EET 2017
    bing: async function(query) {
	query = encodeURIComponent(query)
	let html = await fetch(`https://www.bing.com/search?q=${query}`).then( r => r.text())
	let doc = new DOMParser().parseFromString(html, "text/html")

	let div = doc.querySelector('div.b_caption .b_attribution')
	let p = div.getAttribute('u').split('|')
	return `http://cc.bingj.com/cache.aspx?q=${query}&d=${p[2]}&w=${p[3]}`
    }
}

CacheProviders.def = [
    {
	name: "Google",
	tmpl: 'https://webcache.googleusercontent.com/search?q=cache:%s',
	encode: 1
    },
    {
	name: "Google text only",
	tmpl: 'https://webcache.googleusercontent.com/search?q=cache:%s&strip=1',
	encode: 1
    },
    {
	name: "Bing",
	cb: 'bing'
    },
    { separator: 1 },
    {
	name: "Wayback Machine",
	tmpl: 'https://web.archive.org/web/*/%s',
    },
    {
	name: 'archive.is',
	tmpl: 'http://archive.is/%s',
	encode: 1
    },
    { separator: 1 },
    {
	name: 'archive.is: capture a webpage',
	tmpl: 'https://archive.today/?run=1&url=%s',
	encode: 1
    }
]

exports.CacheProviders = CacheProviders

/* globals chrome */
exports.menu = function(cp) {
    console.info('create menu')
    chrome.contextMenus.create({
	"id": "root",
	"title": "EasyCache",
	"contexts": ["link"]
    })

    let menu_child = function(idx, opts) {
	chrome.contextMenus.create(Object.assign({
	    parentId: "root",
	    contexts: ["link"],
	    id: String(idx)
	}, opts))
    }
    cp.get().forEach( (val, idx) => {
	if (val.separator) {
	    menu_child(idx, { type: "separator" })
	} else {
	    menu_child(idx, { title: val.name })
	}
    })
}
