const app = require('express')()
const fs = require('fs')
const morgan = require('morgan')
const yaml = require('js-yaml')

const phantomjs = require('phantomjs-prebuilt')
let config

try {
  config = yaml.safeLoad(fs.readFileSync(`${__dirname}/config.yaml`, 'utf8'))
} catch(e) {
  // statements
  throw e;
}

app.set('port', config.options.node.port || 1334)
app.set('trust proxy', true)

app.use(morgan('combined'))

app.get('/', (req, res) => {
  let format = req.query.format
  let filename = req.query.filename

  if (filename) {
		config.filename = filename
  }

  if (format == null || !format.match(/(pdf|png|jpeg)/i)) {
    res.status(404).send({ "error": "FFError: Unknown format pdf, png or jpeg" })
  }

  const longfilepath = `${config.options.node.cacheRoot}${config.filename}.${format}`
  const shortfilename = `${config.filename}.${format}`
  const headers = Object.assign({
//     'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=${shortfilename}`,
    'x-timestamp': Date.now()
  }, config.options.node.headers)

  const options = {
    root: `${__dirname}/${config.options.node.cacheRoot}`,
    dotfiles: 'deny',
    headers: headers
  }

  fs.lstat(longfilepath, (err, result) => {
    if (!err) {
      res.type(format)
      res.sendFile(`${config.filename}.${format}`, options, (err) => {
        if (err) throw err
        else console.log('Sent:', shortfilename)
      })
    } else {
      const program = phantomjs.exec('phantomjs-script.js', JSON.stringify(config), format)

      program.stdout.pipe(process.stdout)
      program.stderr.pipe(process.stderr)
      program.on('exit', code => {
        fs.readFile(longfilepath, (err, data) => {
          if (err) throw err

          res.type(format)
          res.set({
            // 'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${shortfilename}`,
            'Content-Length': data.length
          })
          res.send(data)
          console.log('Generate and Sent:', shortfilename)
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
  res.status(err.status || 500).json({ message: err.message })
})

app.listen(app.get('port'))

console.info('Application starting...')
console.log('stuff happening ¯\_(ツ)_/¯ *:', app.get('port'))