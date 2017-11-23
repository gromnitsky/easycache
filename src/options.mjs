'use strict';

let CacheProviders = require('./cacheproviders.mjs')

let render = function(css_query, cp) {
    let row = function(item, idx) {
	let head = `<tr class="cp__item"><td class="cp__item__move">↑↓</td>`
	let tail = `<td class="cp__item__delete"><input type="button" data-idx="${idx}" value="∅"></td></tr>`
	if (item.separator) return head
	    + '<td colspan="3" class="cp__item__separator"><hr></td>'
	    + tail
	return head + `
<td style="width: 35%" class="cp__item__input"><input type="search" spellcheck='false' required value="${item.name}" placeholder="A uniq name">
<td style="width: 50%" class="cp__item__input"><input type="search" spellcheck='false' required value="${item.tmpl}" placeholder="http://example.com/%s">
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
		if (!cp.is_sep(el.dataset.idx) && cp.almost_empty()) {
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
	dragger.on('drop', () => {
	    save()
	    rerender()
	})
    }

    let save = function() {
	let data = Array.from(document.querySelectorAll('table .cp__item'))
	    .map( tr => {
		let r = {}
		let td = tr.querySelectorAll('td')
		if (tr.querySelector(".cp__item__separator")) {
		    r.separator = 1
		} else {
		    r.name = td[1].firstChild.value
		    r.tmpl = td[2].firstChild.value
		    r.new_tab = td[3].firstChild.checked
		}
		return r
	    })
	cp.update(data)
	return data
    }

    rerender()

    document.querySelector('#cp__separator_add').onclick = () => {
	save()
	cp.add({ separator: 1 })
	rerender()
    }

    document.querySelector('#cp__provider_add').onclick = () => {
	save()
	cp.add({ name: '', tmpl: '' })
	rerender()
    }

    document.querySelector('#cp__reset').onclick = () => {
	if (!window.confirm("Are you sure?")) return
	cp.reset()
	rerender()
    }

    document.querySelector('form').onsubmit = evt => {
	evt.preventDefault()
	let data = save()
	window.localStorage.setItem('cache_providers', JSON.stringify(data))
    }
}

document.addEventListener('DOMContentLoaded', main)
