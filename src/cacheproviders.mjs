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
	return p.tmpl ? p.tmpl.replace(/%s/, encodeURIComponent(url)) : p.cb(name)
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
	tmpl: 'https://wayback.archive.org/web/*/%s',
	new_tab: 1
    },
    {
	name: 'archive.is: capture a webpage',
	tmpl: 'https://archive.today/?run=1&url=%s'
    }
]

module.exports = CacheProviders
