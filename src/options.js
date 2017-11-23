'use strict';

class CacheProviders {
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

let render = function(css_query, cp) {
    let row = function(item, idx) {
	let head = `<tr class="cp__item"><td class="cp__item__move">↑↓</td>`
	let tail = `<td class="cp__item__delete"><input type="button" data-idx="${idx}" value="∅"></td></tr>`
	if (item.separator) return head
	    + '<td colspan="3"><hr></td>'
	    + tail
	return head + `
<td style="width: 35%" class="cp__item__input"><input type="search" spellcheck='false' required value="${item.name}">
<td style="width: 50%" class="cp__item__input"><input type="search" spellcheck='false' required value="${item.tmpl}">
<td><input type="checkbox" ${item.new_tab ? "checked" : ""}></td>` + tail
    }
    document.querySelector(css_query).innerHTML = cp.get().map(row).join("\n")
}

/* global tableDragger */
let main = function() {
    let cp = new CacheProviders()
    let dragger
    let rerender = () => {
	if (dragger) dragger.destroy()
	render('table tbody', cp)

	document.querySelectorAll('.cp__item__delete input').forEach(el => {
	    el.onclick = () => {
		if (cp.size() === 1) { // chk for separators
		    alert("meh")
		    return
		}
//		if (!window.confirm("Sure?")) return
		cp.delete(el.dataset.idx)
		rerender()
	    }
	})

	dragger = tableDragger(document.querySelector('table'), {
	    mode: 'row',
	    dragHandler: '.cp__item__move',
	    onlyBody: true,
	})
    }

    rerender()

    document.querySelector('#cp__separator_add').onclick = () => {
	cp.add({ separator: 1 })
	rerender()
    }

    document.querySelector('#cp__provider_add').onclick = () => {
	cp.add({ name: '', tmpl: '' })
	rerender()
    }

    document.querySelector('#cp__reset').onclick = () => {
	cp.reset()
	rerender()
    }

    document.querySelector('form').onsubmit = evt => {
	evt.preventDefault()
	console.log('TODO')
    }
}

document.addEventListener('DOMContentLoaded', main)
