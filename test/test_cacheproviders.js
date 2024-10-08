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

let providers = cache_providers.CacheProviders.def

suite('CacheProviders', function() {
    setup(function() {
	this.storage = new Storage()
	this.cp = new cache_providers.CacheProviders(this.storage)
	this.bing_idx = 2
	this.separator_idx = 6
	this.total = 8
	chrome.runtime.lastError = null
	cache_providers.CacheProviders.def = [...providers]
    })

    test('merge w/ new providers', async function() {
	await this.cp.load()
	this.cp.delete(0)
	await this.cp.save()

	let p = cache_providers.CacheProviders.def
	p.push({name: 'new1', id: 'new1-123'})
	p.push({name: 'new2', id: 'new2-456'})

	await this.cp.load()
	assert.equal(this.cp.findIndex('Google'), -1)
	assert.equal(this.cp.findIndex('new1'), -1)
	assert.equal(this.cp.findIndex('new2'), -1)
	let before = this.cp.get().length

	this.cp.merge()

	assert.equal(this.cp.get().length, before + 3 + 1)
	assert(this.cp.findIndex('Google') !== -1)
	assert(this.cp.findIndex('new1') !== -1)
	assert(this.cp.findIndex('new2') !== -1)
    })

    test('merge w/ nothing new', async function() {
	await this.cp.load()
	let before = this.cp.get().length
	this.cp.merge()
	assert.equal(this.cp.get().length, before)
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
		     'https://archive.is/http%3A%2F%2Fexample.com%2F%3Fq%3Dfoo')
    })
})

let sprintf = cache_providers.sprintf

suite('misc', function() {
    test('sprintf', function() {
	assert.equal(sprintf(), '')
	assert.equal(sprintf(''), '')
	assert.equal(sprintf('omg'), 'omg')
	assert.equal(sprintf('omg%s', 'lol'), 'omglol')
	assert.equal(sprintf('%%s%s%s %s4', 1,2), '%s12 4')
    })
})
