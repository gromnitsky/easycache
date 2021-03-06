import * as cache_providers from './cacheproviders.js'

let spinner = function() {
    let node = document.querySelector('#warning_0af4cd01-9da2-4a0b-9daf-b1a0f67040d1')
    node.style.display = /^(none)?$/.test(node.style.display) ? 'flex' : 'none'
}

let render = function(css_query, cp, siteurl) {
    let li = function(item) {
	if (item.separator) return '<li><hr></li>'
	return `<li><a target='_blank' href="#">${cache_providers.escape_input(item.name)}</a></li>`
    }
    let doc = document.querySelector(css_query)
    doc.innerHTML = cp.get().map(li).join("\n")

    doc.querySelectorAll('a').forEach( link => {
	link.onclick = (evt) => {
	    evt.preventDefault()
	    spinner()

	    let name = link.innerText
	    cp.url(name, siteurl).then( url => {
		spinner()
		console.log(url)
		chrome.tabs.create({url}, () => window.close())
	    }).catch(e => {
		alert(`Failed to talk to ${name}`)
		spinner()
		throw e
	    })
	}
    })
}

let main = function main() {
    // get current tab url
    chrome.tabs.query({currentWindow: true, active: true}, async tabs => {
	let cp = new cache_providers.CacheProviders()
	await cp.load()
	render('ul', cp, tabs[0].url)
    })
}

document.addEventListener('DOMContentLoaded', main)
