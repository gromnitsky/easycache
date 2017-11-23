export default class CacheProviders {
    // TODO: localstorage
    get() {
	if (this._list) return this._list
	this._list = Object.assign([], CacheProviders.def)
	return this._list
    }

    size() { return this.get().length }

    add(obj) { return this.get().push(obj) }

    findIndex(name) {
	return this.get().findIndex( val => val.name && val.name === name)
    }

    url(name, url = 'https://www.yahoo.com/') {
	let p = this.get()[this.findIndex(name)]
	return p.tmpl ? p.tmpl.replace(/%s/, encodeURIComponent(url)) : p.cb(name)
    }

    delete(idx) { this.get().splice(idx, 1) }

    reset() { this._list = null }

    swap(a, b) {
	let t = this.get();
	[t[a], t[b]] = [t[b], t[a]]
    }
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
