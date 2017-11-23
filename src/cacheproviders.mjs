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

    url(name, url = 'https://www.yahoo.com/') {
	let p = this.get()[this.findIndex(name)]
	return p.tmpl ? p.tmpl.replace(/%s/, url) : p.cb(name)
    }

    is_sep(idx) { return this.get()[idx].separator }

    delete(idx) { this.get().splice(idx, 1) }

    reset() {
	window.localStorage.removeItem('cache_providers')
	this._list = null
    }

    update(data) { this._list = data }
}

CacheProviders.def = [
    {
	name: "Google",
	tmpl: 'https://webcache.googleusercontent.com/search?q=cache:%s'
    },
    {
	name: "Google text only",
	tmpl: 'https://webcache.googleusercontent.com/search?q=cache:%s&strip=1'
    },
    { separator: 1 },
    {
	name: "Wayback Machine",
	tmpl: 'https://web.archive.org/web/*/%s',
	new_tab: 1
    },
    {
	name: 'archive.is: capture a webpage',
	tmpl: 'https://archive.today/?run=1&url=%s'
    }
]

exports.CacheProviders = CacheProviders

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
	    menu_child(idx, {type: "separator" })
	} else {
	    menu_child(idx, {
		title: val.name,
		id: String(idx)
	    })
	}
    })
}
