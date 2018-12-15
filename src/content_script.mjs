console.log('easycache')

chrome.runtime.onMessage.addListener( (req, sender, res) => {
    console.log('alert', sender.id)
    alert(req)
    res(true)
})
