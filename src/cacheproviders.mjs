'use strict';

exports.storage = chrome.storage[/@temporary/.test(chrome.runtime.id) ? 'local' : 'sync']

class CacheProviders {
    get() {
	if (this._list) return Promise.resolve(this._list)
	return new Promise( (resolve, reject) => {
	    exports.storage.get(null, saved => {
		this._list = saved.cache_providers ? saved.cache_providers : Object.assign([], CacheProviders.def)
		resolve(this._list)
	    })
	})
    }

    async almost_empty() {
	return (await this.get()).filter(val => val.name).length === 1
    }

    async add(obj) { return (await this.get()).push(obj) }

    async findIndex(name) {
	return (await this.get()).findIndex( val => val.name && val.name === name)
    }

    async url(name, siteurl = 'https://www.yahoo.com/') {
	let p = (await this.get())[await this.findIndex(name)]
	let url = p.encode ? encodeURIComponent(siteurl) : siteurl
	if (p.tmpl) return p.tmpl.replace(/%s/, url)
	return CacheProviders.callbacks[p.cb](url)
    }

    async is_sep(idx) { return (await this.get())[idx].separator }

    async delete(idx) { (await this.get()).splice(idx, 1) }

    reset() {
	return new Promise( (resolve, reject) => {
	    exports.storage.remove('cache_providers', () => {
		this._list = null
		resolve(true)
	    })
	})
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
exports.menu = async function(cp) {
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
    };
    (await cp.get()).forEach( (val, idx) => {
	if (val.separator) {
	    menu_child(idx, { type: "separator" })
	} else {
	    menu_child(idx, { title: val.name })
	}
    })
}

exports.escape_input = function(str) {
    if (!str) return str
    return str.replace(/[&<>"'`]/g, char => ({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'`': '&#x60;',
    }[char]))
}
