let guess_storage_engine = function() {
    return new Promise( (resolve, _) => {
	chrome.management.getSelf( info => {
	    resolve(chrome.storage[info.installType === 'development' ? 'local' : 'sync'])
	})
    })
}

export class CacheProviders {
    constructor(storage) {
	this.storage = storage || guess_storage_engine()
	this.skey = 'cache_providers'
    }

    async load() {
	let storage = await this.storage
	return new Promise( (resolve, reject) => {
	    storage.get(null, data => {
		if (chrome.runtime.lastError) {
		    reject(chrome.runtime.lastError)
		    return
		}
		this.list = this.list || data[this.skey]
		    || Object.assign([], CacheProviders.def) // a shallow copy
		resolve(true)
	    })
	})
    }

    async save() {
	let storage = await this.storage
	return new Promise( (resolve, reject) => {
	    storage.set({[this.skey]: this.list}, () => {
		chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(true)
	    })
	})
    }

    async reset() {
	let storage = await this.storage
	return new Promise( (resolve, reject) => {
	    storage.remove(this.skey, () => {
		if (chrome.runtime.lastError) {
		    reject(chrome.runtime.lastError)
		    return
		}
		this.list = null
		resolve(true)
	    })
	}).then( () => this.load())
    }

    get() { return this.list }
    almost_empty() { return this.list.filter(val => val.name).length === 1 }
    add(obj) { return this.list.push(obj) }
    findIndex(name) { return this.list.findIndex( val => val.name && val.name === name) }
    is_sep(idx) { return this.list[idx].separator }
    delete(idx) { this.list.splice(idx, 1) }
    update(data) { this.list = data }

    merge() { // add to `this.list` the missing staff from `CacheProviders.def`
	let missing = CacheProviders.def.filter( val => {
	    return !val.separator && this.findIndex(val.name) === -1
	})
	if (missing.length) {
	    if (this.list[this.list.length-1].separator)
		this.list = [...this.list, ...missing]
	    else
		this.list = [...this.list, { separator: 1 }, ...missing]
	}
	return missing.length
    }

    async url(name, siteurl = 'https://www.yahoo.com/') {
	let p = this.list[this.findIndex(name)]
	let url = p.encode ? encodeURIComponent(siteurl) : siteurl
	if (p.tmpl) return sprintf(p.tmpl, url)
	return CacheProviders.callbacks[p.cb](url)
    }
}

let dom = async function(tmpl, query, encode = true) {
    if (encode) query = encodeURIComponent(query)
    let url = sprintf(tmpl, query)
    let html = await efetch(url).then( r => r.text())
    return new DOMParser().parseFromString(html, "text/html")
}

let efetch = function(url, opt) {
    let fetcherr = r => {
	if (!r.ok) throw new Error(r.statusText)
	return r
    }
    return fetch(url, opt).then(fetcherr)
}

CacheProviders.callbacks = {
    // retrieve the 1st cached result of the search;
    // works as of Tue 10 Sep 20:40:22 EEST 2024
    bing: async function(query) {
        let doc = await dom('https://www.bing.com/search?q=%s', query)
        let div = doc.querySelector('div.b_attribution')
        let p = div.getAttribute('u').split('|')
        return `http://cc.bingj.com/cache.aspx?q=${query}&d=${p[2]}&w=${p[3]}`
    },
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
        tmpl: 'https://archive.is/%s',
        encode: 1
    },
    { separator: 1 },
    {
        name: 'archive.is: capture a webpage',
        tmpl: 'https://archive.is/?run=1&url=%s',
        encode: 1
    }
]

export let menu = function(cp, skip_non_template_based) {
    console.info('create menu')
    let ctx = ["link", "image", "selection"]
    chrome.contextMenus.create({
	"id": "root",
	"title": "EasyCache",
	"contexts": ctx
    })

    let menu_child = function(idx, opts) {
	chrome.contextMenus.create(Object.assign({
	    parentId: "root",
	    contexts: ctx,
	    id: String(idx)
	}, opts))
    };

    for (let [idx, val] of cp.get().entries()) {
        if (skip_non_template_based && val.cb) continue
        if (val.separator) {
            menu_child(idx, { type: "separator" })
        } else {
            menu_child(idx, { title: val.name })
        }
    }
}

export let escape_input = function(str) {
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

let is_str = function(s) {
    return Object.prototype.toString.call(s) === "[object String]"
}

export let sprintf = function(format, ...args) { // understands only %s
    if (!is_str(format)) return ''
    return format.replace(/%(.)/g, (_, p1) => {
	if (p1 === '%') return p1
	let arg = args.shift()
	return arg == null ? '' : arg.toString()
    })
}
