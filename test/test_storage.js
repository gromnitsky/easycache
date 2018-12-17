/* global assert */

import Storage from './storage-mock.js'
import * as cache_providers from '../src/cacheproviders.js'

let rejects = async function(fn) { // chai doesn't have assert.rejects()
    let failed = 0
    try {
	await fn()
    } catch(e) {
	++failed
    }
    assert(failed, `${fn.name} wasn't rejected`)
}

suite('CacheProviders', function() {
    setup(function() {
	this.storage = new Storage()
	this.cp = new cache_providers.CacheProviders(this.storage)
	this.bing_idx = 2
	this.separator_idx = 3
	this.total = 8
	chrome.runtime.lastError = null
    })

    test('get', async function() {
	assert.equal(this.cp.list, undefined)
	await this.cp.load()

	assert.equal(this.cp.get().length, this.total)
	assert.equal(this.cp.get()[this.bing_idx].name, "Bing")
    })

    test('load is failing', async function() {
	chrome.runtime.lastError = new Error("yakas' pomylka")
	await rejects(this.cp.load.bind(this.cp))
    })

    test('save is failing', async function() {
	chrome.runtime.lastError = new Error("yakas' pomylka")
	await rejects(this.cp.save.bind(this.cp))
    })

    test('reset is failing', async function() {
	chrome.runtime.lastError = new Error("yakas' pomylka")
	await rejects(this.cp.reset.bind(this.cp))
    })

    test('reset', async function() {
	await this.cp.load()
	this.cp.delete(0)
	await this.cp.save()
	await this.cp.load()
	assert.equal(this.cp.get().length, this.total - 1)

	await this.cp.reset()
	assert.equal(this.cp.get().length, this.total)
    })

    test('delete', async function() {
	await this.cp.load()
	await this.cp.save()

	this.cp.delete(0)
	this.cp.delete(0)
	this.cp.delete(0)

	await this.cp.save()

	let edited = new cache_providers.CacheProviders(this.storage)
	await edited.load()
	assert.equal(edited.get().length, this.total - 3)
    })

    test('add', async function() {
	await this.cp.load()
	this.cp.add({name: 'omglol'})
	assert.equal(this.cp.get().length, this.total + 1)
    })

    test('findIndex', async function() {
	await this.cp.load()
	assert.equal(this.cp.findIndex('Bing'), this.bing_idx)
	assert.equal(this.cp.findIndex('omglol'), -1)
    })

    test('is_sep', async function() {
	await this.cp.load()
	assert(this.cp.is_sep(this.separator_idx))
	assert(!this.cp.is_sep(this.bing_idx))
    })

    test('url', async function() {
	await this.cp.load()
	assert.equal(await this.cp.url('Wayback Machine',
				       'http://example.com/?q=foo'),
		     'https://web.archive.org/web/*/http://example.com/?q=foo')
	assert.equal(await this.cp.url('archive.is',
				       'http://example.com/?q=foo'),
		     'http://archive.is/http%3A%2F%2Fexample.com%2F%3Fq%3Dfoo')
    })
})
