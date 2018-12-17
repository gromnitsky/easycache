// https://developer.chrome.com/extensions/storage

export default class Storage {
    constructor() {
	this.db = {}
	this.NI = new Error('not implemented')
    }

    get(what, cb) {
	if (what !== null) throw this.NI
	if (cb) setTimeout(() => cb(this.db), 0)
    }

    set(items, cb) {
	Object.assign(this.db, items)
	if (cb) setTimeout(() => cb(), 0)
    }

    remove(key, cb) {
	if (Array.isArray(key)) throw this.NI
	delete this.db[key]
	if (cb) setTimeout(() => cb(), 0)
    }
}

// ff
if (typeof chrome === 'undefined') window.chrome = { runtime: {} }
