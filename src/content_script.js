console.log('easycache')

chrome.runtime.onMessage.addListener(listener)

function listener(req, sender, res) {
    console.log(sender.id, 'onMessage', req.type)
    switch (req.type) {
    case 'alert':
        alert(req.value)
        break
    default:
        break
    }
    res(true)
}
