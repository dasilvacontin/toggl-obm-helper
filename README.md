# toggl-obm-helper

[![Build Status][travis-image]][travis-url]

Helper module for OBM experiments.

## Install

```sh
$ npm install --save toggl-obm-helper
```

## Usage

```js
import OBM from 'toggl-obm-helper'

const nr = 42
const userId = 1337
const obm = new OBM(nr, userId)

obm.ready().then(function () {
  if (obm.isIncluded()) {
    // show experiment
	obm.sendAction('seen', 1)
  }
})
```


## API

Coming soon...

## License

MIT © [David da Silva](http://dasilvacont.in)

[travis-image]: https://travis-ci.org/toggl/toggl-obm-helper.svg?branch=master
[travis-url]: https://travis-ci.org/toggl/toggl-obm-helper
