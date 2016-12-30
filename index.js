const app = require('express')()
const fs = require('fs')
const morgan = require('morgan')

const phantomjs = require('phantomjs-prebuilt')

app.set('port', process.env.PORT || 1334)
app.set('trust proxy', true)

app.use(morgan('combined'))

app.get('/:page', (req, res) => {
  const page = req.params.page

  const options = {
    root: __dirname + '/docs/',
    dotfiles: 'deny',
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=' + page + '.pdf',
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  fs.lstat('docs/' + page + '.pdf', (err, result) => {
    if (!err) {
      res.sendFile(page + '.pdf', options, (err) => {
        if (err) throw err
        else console.log('Sent:', page + '.pdf')
      })
    }
    else {
      const program = phantomjs.exec('phantomjs-script.js', page)

      program.stdout.pipe(process.stdout)
      program.stderr.pipe(process.stderr)
      program.on('exit', code => {
        fs.readFile('docs/' + page + '.pdf', (err, data) => {
          if (err) throw err
          // if (data) res.download('docs/' + page + '.pdf')

          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=' + page + '.pdf',
            'Content-Length': data.length
          })
          res.send(data)
          console.log('Generate and Sent:', page + '.pdf')
        })
      })
    }
  })
})


app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})


app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ message: err.message })
})

app.listen(app.get('port'))

console.info('Application starting...')
console.log('stuff happening ¯\_(ツ)_/¯ *:', app.get('port'))