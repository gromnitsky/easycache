console.log('easycache')

// spinner
let div = document.createElement('div')
div.id = 'warning_0af4cd01-9da2-4a0b-9daf-b1a0f67040d1'
div.innerHTML = '<div id="warning_0af4cd01-9da2-4a0b-9daf-b1a0f67040d1--spinner"></div>'
document.body.appendChild(div)

let spinner = function() {
    let node = document.querySelector('#' + div.id)
    node.style.display = /^(none)?$/.test(node.style.display) ? 'flex' : 'none'
}

chrome.runtime.onMessage.addListener( (req, sender, res) => {
    console.log(sender.id, 'onMessage', req.type)
    switch (req.type) {
    case 'alert':
	alert(req.value)
	break
    case 'spinner':
	spinner()
	break
    }
    res(true)
})
