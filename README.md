# aproxy

*Renders PDF using phantom.js and Node.js*

![Capture Sketch][]


## Why?

Configure `config/*.yml` files to suite you need.

  - `config.yml` - for generating meta tags and about, profile page.

## Usage

Using *aproxy* is ridiculously simple.

`https://aproxy.herokuapp.com` - API URI

`?format=pdf` - Generated file format. Any? `.pdf|.png|.jpeg`

`?filename=resume` - Generated file name. Defaults? `default`

`?url=https://www.akinjide.me` - URI to capture. Defaults? `https://www.akinjide.me`

## Example

`https://aproxy.herokuapp.com?format=png&filename=google&url=https://www.google.com`

## License

MIT

  [Capture Sketch]: /_static/capture-sketch.jpg "Capture Sketch"
