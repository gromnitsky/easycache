'use strict';

class CacheProviders {
    constructor() {
    }

    get() {
	// TODO: localstorage
	return CacheProviders.def
    }

    url(name, url = 'https://www.yahoo.com/') {
	let p = this.get().find( val => val.name && val.name === name)
	if (!p) throw new Error(`provider '${name}' not found`)
	return p.tmpl ? p.tmpl.replace(/%s/, encodeURIComponent(url)) : p.cb(name)
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

let render = function(css_query, cp) {
    let row = function(item) {
	let head = '<tr class="cp__item"><td class="cp__item__delete">∅</td>'
	if (item.separator) return head +
	    '<td class="cp__item__separator" colspan="3"><hr></td></tr>'
	return head + `
<td style="width: 35%" class="cp__item__input"><input type="search" spellcheck='false' required value="${item.name}">
<td style="width: 55%" class="cp__item__input"><input type="search" spellcheck='false' required value="${item.tmpl}">
<td><input type="checkbox" ${item.new_tab ? "checked" : ""}></td>
</tr>`
    }
    document.querySelector(css_query).innerHTML = cp.get().map(row).join("\n")
}

let main = function() {
    let cp = new CacheProviders()
    render('#cp__list', cp)
}

document.addEventListener('DOMContentLoaded', main)
