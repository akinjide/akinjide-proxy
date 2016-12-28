console.log('Loading web page')

const page = require('webpage').create()
const args = require('system').args
const url = 'https://resume.akinjide.me/#' + args[1]

page.viewportSize = { width: 1024, height: 768 }
page.clipRect = { top: 0, left: 0 }

page.open(url, function(status) {
  console.log('Page loaded')

  setTimeout(function() {
    page.render('docs/' + args[1] + '.pdf')
    console.log('Page rendered')
    phantom.exit()
  }, 10000)
})