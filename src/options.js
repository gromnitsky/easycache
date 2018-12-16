/* globals tableDragger, plainDialogs */
import * as cache_providers from './cacheproviders.js'

let render = async function(css_query, cp) {
    let row = function(item, idx) {
	let name = cache_providers.escape_input(item.name)
	let tmpl = cache_providers.escape_input(item.tmpl)
	let head = `<tr class="cp__item"><td class="cp__item__move">↑↓</td>`
	let tail = `<td class="cp__item__delete"><input type="button" data-idx="${idx}" value="∅"></td></tr>`
	if (item.separator) return head
	    + '<td colspan="3" class="cp__item__separator"><hr></td>'
	    + tail
	if (item.cb) return head + `
<td style="width: 35%" class="cp__item__predefined"><input type="search" value="${name}" data-callback="${item.cb}" disabled></td>
<td></td><td></td>`
	    + tail
	return head + `
<td style="width: 35%" class="cp__item__input"><input type="search" spellcheck='false' required value="${name}" placeholder="A uniq name"></td>
<td style="width: 50%" class="cp__item__input"><input type="search" spellcheck='false' required value="${tmpl}" placeholder="http://example.com/%s"></td>
<td><input type="checkbox" ${item.encode ? "checked" : ""}></td>` + tail
    }
    document.querySelector(css_query).innerHTML = (await cp.get())
	.map(row).join("\n")
}

let main = function() {
    let cp = new cache_providers.CacheProviders()
    let dragger
    let rerender = async () => {
	if (dragger) dragger.destroy()
	await render('table tbody', cp)

	document.querySelectorAll('.cp__item__delete input').forEach(el => {
	    el.onclick = async () => {
		if (!(await cp.is_sep(el.dataset.idx)) && (await cp.almost_empty())) {
		    plainDialogs.alert("meh")
		    return
		}
		cp.delete(el.dataset.idx).then(rerender)
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
		} else if (tr.querySelector(".cp__item__predefined")) {
		    r.name = td[1].firstChild.value
		    r.cb = td[1].firstChild.dataset.callback
		} else {
		    r.name = td[1].firstChild.value
		    r.tmpl = td[2].firstChild.value
		    r.encode = td[3].firstChild.checked
		}
		return r
	    })
	cp.update(data)
	return data
    }

    rerender()

    document.querySelector('#cp__separator_add').onclick = () => {
	save()
	cp.add({ separator: 1 }).then(rerender)
    }

    document.querySelector('#cp__provider_add').onclick = () => {
	save()
	cp.add({ name: '', tmpl: '' }).then(rerender)
    }

    let menu_upd = () => {
	chrome.contextMenus.removeAll( () => {
	    cache_providers.menu(cp)
	})
    }

    document.querySelector('#cp__reset').onclick = () => {
	plainDialogs.confirm("Are you sure?")
	    .then(cp.reset.bind(cp)).then(rerender).then(menu_upd)
    }

    /* globals chrome */
    document.querySelector('form').onsubmit = evt => {
	evt.preventDefault()
	let data = save()
	cache_providers.storage.set({cache_providers: data}, () => {
	    menu_upd()
	})
    }
}

document.addEventListener('DOMContentLoaded', main)
