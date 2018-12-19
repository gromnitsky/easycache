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
	if (p.tmpl) return p.tmpl.replace(/%s/, url) // FIXME
	return CacheProviders.callbacks[p.cb](url)
    }
}

let dom = async function(tmpl, query, encode = true) {
    if (encode) query = encodeURIComponent(query)
    let url = tmpl.replace(/%s/, query) // FIXME
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
    // works as of Sat Nov 25 07:00:14 EET 2017
    bing: async function(query) {
	let doc = await dom('https://www.bing.com/search?q=%s', query)
	let div = doc.querySelector('div.b_caption .b_attribution')
	let p = div.getAttribute('u').split('|')
	return `http://cc.bingj.com/cache.aspx?q=${query}&d=${p[2]}&w=${p[3]}`
    },

    // retrieve the 1st cached result of the search;
    // works as of Tue Dec 18 00:02:40 EET 2018
    sogou: async function(query) {
	let doc = await dom('https://www.sogou.com/web?query=%s', query)
	return doc.querySelector('a[id^="sogou_snapshot_"]').href
    },

    qihoo_360: async function(query) { // broken: the res url requires a referer
	let doc = await dom('https://www.so.com/s?q=%s', query)
	return doc.querySelector('a[class="m"]').href
    },

    // retrieve the 1st cached result of the search;
    // works as of Tue Dec 18 00:12:38 EET 2018
    yahoo_japan: async function(query) {
	let doc = await dom('https://search.yahoo.co.jp/search?p=%s', query)
	return doc.querySelector('div[class="bd"] a').href
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
    {
	name: "Sogou 搜狗",
	cb: 'sogou'
    },
    {
	name: "Naver 네이버",
	tmpl: 'http://125.209.214.38/search2.naver?where=web_html&u=%s',
	encode: 1
    },
    {
	name: "Yahoo! Japan ヤフー株式会社",
	cb: 'yahoo_japan'
    },
    { separator: 1 },
    {
	name: "Time Travel",
	tmpl: 'http://timetravel.mementoweb.org/list/0/%s'
    },
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
	tmpl: 'https://archive.today/?run=1&url=%s',
	encode: 1
    }
]

export let menu = function(cp) {
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
    cp.get().forEach( (val, idx) => {
	if (val.separator) {
	    menu_child(idx, { type: "separator" })
	} else {
	    menu_child(idx, { title: val.name })
	}
    })
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
