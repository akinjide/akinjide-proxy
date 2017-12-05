console.log('Loading web page')

const page = require('webpage').create()
const args = require('system').args
const config = JSON.parse(args[1])
const format = args[2]
const url = config.baseurl
const longfilepath = config.options.node.cacheRoot + config.filename + "." + format

page.viewportSize = {
  width: config.options.phantom.viewportSize.width,
  height: config.options.phantom.viewportSize.height
}

page.clipRect = {
  top: config.options.phantom.clipRect.top,
  left: config.options.phantom.clipRect.left
}

page.open(url, function(status) {
  console.log('Page loaded')

  setTimeout(function() {
    page.render(longfilepath)
    console.log('Page rendered')
    phantom.exit()
  }, 10000)
})