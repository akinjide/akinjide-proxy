const forever = require('forever-monitor')

const child = new (forever.Monitor)('index.js', {
  max: 3,
  silent: false,
  args: []
})

child.on('watch:restart', (info) => console.error('Restaring script because ' + info.file + ' changed'))
child.on('restart', () => console.error('Forever restarting script for ' + child.times + ' time'))
child.on('exit', () => console.log('index.js has exited after 3 restarts'))
child.start()