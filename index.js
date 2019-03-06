const app = require('express')()
const fs = require('fs')
const morgan = require('morgan')
const yaml = require('js-yaml')
const phantomjs = require('phantomjs-prebuilt')

const regexp = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
let config

try {
  config = yaml.safeLoad(fs.readFileSync(`${__dirname}/config.yaml`, 'utf8'))
} catch(e) {
  throw e;
}

app.set('port', process.env.PORT || config.options.node.port)
app.set('trust proxy', true)

app.use(morgan('combined'))

app.get('/ping', (req, res) => res.status(200).send('PONG'))
app.get('/', (req, res) => {
  if (req.query.filename) {
    config.filename = req.query.filename
  }

  if (req.query.url || regexp.test(req.query.url)) {
    // FIXME: encodeURIComponent url but test http or https first
    config.baseurl = req.query.url
  }

  if (+req.query.delay) {
    config.options.delay = +req.query.delay
  }

  if (req.query.format == null) {
    return res.status(400).send({ "?format": "is required" })
  }

  if (!req.query.format.match(/(pdf|png|jpeg)/i)) {
    return res.status(400).send({ "error": "FFERR: Unknown format pdf, png or jpeg" })
  }

  config.format = req.query.format
  config.long_file_path = `${config.options.node.cacheRoot}${config.filename}.${config.format}`
  config.short_filename = `${config.filename}.${config.format}`

  let headers = Object.assign({
    'Content-Disposition': `attachment; filename=${config.short_filename}`,
    'x-timestamp': Date.now()
  }, config.options.node.headers)

  const options = {
    root: `${__dirname}/${config.options.node.cacheRoot}`,
    dotfiles: 'deny',
    headers: headers
  }

  fs.lstat(config.long_file_path, (err, result) => {
    if (!err) {
      res.type(config.format)
      res.sendFile(config.short_filename, options, (err) => {
        if (err) throw err
        else console.log('Sent:', config.short_filename)
      })
    } else {
      const program = phantomjs.exec('phantomjs-script.js', JSON.stringify(config))

      program.stdout.pipe(process.stdout)
      program.stderr.pipe(process.stderr)
      program.on('exit', code => {
        fs.readFile(config.long_file_path, (err, data) => {
          if (err) console.log('File write: ', err)

          res.type(config.format)
          res.set({
            'Content-Disposition': `attachment; filename=${config.short_filename}`,
            'Content-Length': data.length
          })
          res.send(data)
          console.log('Generate and Sent: %s', config.short_filename)
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
console.log('stuff happening ¯\_(ツ)_/¯ *: %s', app.get('port'))
