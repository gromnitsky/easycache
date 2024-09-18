/* globals plainDialogs */
import * as cache_providers from './cacheproviders.js'

let spinner = function() {
    let node = document.querySelector('#warning_0af4cd01-9da2-4a0b-9daf-b1a0f67040d1')
    node.style.display = /^(none)?$/.test(node.style.display) ? 'flex' : 'none'
}

function render(node, cp) {
    let li = function(item) {
        if (item.separator) return '<li><hr></li>'
        return `<li><a target='_blank' href="#">${cache_providers.escape_input(item.name)}</a></li>`
    }
    node.innerHTML = cp.get().map(li).join("\n")
}

async function click(event, cp, tab_url) {
    if (event.target.tagName !== 'A') return
    event.preventDefault()
    spinner()

    try {
        new URL(tab_url)
    } catch (_) {
        await plainDialogs.alert('Invalid URL')
        window.close()
        return
    }

    let provider_name = event.target.innerText
    cp.url(provider_name, tab_url).then( url => {
        spinner()
        chrome.tabs.create({url}, () => window.close())
    }).catch( async e => {
        await plainDialogs.alert(`Failed to talk to ${provider_name}. Inspect the popup in devtools.`)
        spinner()
        throw e
    })
}

let main = function main() {
    let ul = document.querySelector('ul')

    // get current tab url
    chrome.tabs.query({currentWindow: true, active: true}, async tabs => {
        let cp = new cache_providers.CacheProviders()
        await cp.load()
        render(ul, cp)
        ul.addEventListener('click', event => {
            click(event, cp, tabs[0].url)
        })

        // if the popup was invoked via a context menu, simulate a
        // click
        chrome.runtime.sendMessage({'provider': true}, res => {
            if (!res) return
            click({ // simulated event
                preventDefault: () => {},
                target: {
                    tagName: 'A',
                    innerText: res.name
                }
            }, cp, res.siteurl)
        })
    })
}

document.addEventListener('DOMContentLoaded', main)
