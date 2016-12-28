const forever = require('forever')

const child = new (forever.monitor)('index.js', {
  max: 3, silent: false, options: []
})

//child.on('exit', this.callback);
child.start()

forever.startServer(child)