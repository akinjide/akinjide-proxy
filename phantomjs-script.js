console.log('Loading web page')

const page = require('webpage').create()
const args = require('system').args
const config = JSON.parse(args[1])

page.viewportSize = {
  width: config.options.phantom.viewportSize.width,
  height: config.options.phantom.viewportSize.height
}

page.clipRect = {
  top: config.options.phantom.clipRect.top,
  left: config.options.phantom.clipRect.left
}

page.open(config.baseurl, function(status) {
  console.log('Page loaded: ', status)

  setTimeout(function() {
    page.render(config.long_file_path)
    console.log('Page rendered')
    phantom.exit()
  }, config.options.delay)
})
