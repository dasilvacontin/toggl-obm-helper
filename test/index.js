import test from 'tape'
import sinon from 'sinon'
import OBM from '../lib'

const nr = 6
const userId = 11

const noop = function () {}
const $ = global.$ = { ajax: noop }

test('mock', function (t) {
  const obm = new OBM(nr, userId)
  obm.mock({ nr, included: true, actions: 'manager,blue' })

  t.ok(obm.isRunning(), 'isRunning check')
  t.ok(obm.isIncluded(), 'isIncluded check')
  t.notOk(obm.isExcluded(), 'isExcluded check')
  t.ok(obm.getActionExists('manager'), 'getActionExists check')
  t.ok(obm.getActionExists('blue'), 'getActionExists check')
  t.notOk(obm.getActionExists('programmer'), 'getActionExists check')
  t.end()
})

test('isRunning', function (t) {
  const obm = new OBM(nr, userId)

  obm.mock({ nr })
  t.ok(obm.isRunning())

  obm.mock({ nr: 5 })
  t.notOk(obm.isRunning())

  t.end()
})

test('isIncluded', function (t) {
  const obm = new OBM(nr, userId)

  obm.mock({ nr, included: true })
  t.ok(obm.isIncluded())

  obm.mock({ nr, included: false })
  t.notOk(obm.isIncluded())

  obm.mock({ nr: 5, included: true })
  t.notOk(obm.isIncluded())

  obm.mock({ nr: 5, included: false })
  t.notOk(obm.isIncluded())

  t.end()
})

test('isExcluded', function (t) {
  const obm = new OBM(nr, userId)

  obm.mock({ nr, included: true })
  t.notOk(obm.isExcluded())

  obm.mock({ nr, included: false })
  t.ok(obm.isExcluded())

  obm.mock({ nr: 5, included: true })
  t.notOk(obm.isExcluded())

  obm.mock({ nr: 5, included: false })
  t.notOk(obm.isExcluded())

  t.end()
})

test('getActionExists', function (t) {
  const obm = new OBM(nr, userId)

  obm.mock({ actions: '' })
  t.notOk(obm.getActionExists('blue'))

  obm.mock({ actions: 'blue' })
  t.ok(obm.getActionExists('blue'))

  obm.mock({ actions: 'blue,red' })
  t.ok(obm.getActionExists('blue'))

  obm.mock({ actions: 'blue,red' })
  t.ok(obm.getActionExists('red'))

  t.end()
})

test('getStorageKey', function (t) {
  let obm = new OBM(nr, userId)
  t.equal(
    obm.getStorageKey('shown'),
    `obm${ nr }_shown_${ userId }`
  )
  t.end()
})

const cookieMock = function () {
  const store = {}
  return function (key, value) {
    if (value == null) {
      return store[key]
    } else {
      store[key] = String(value)
    }
  }
}

test('getData/saveData/getBool/saveBool/dataExists', function (t) {
  $.cookie = cookieMock()
  let obm = new OBM(6, userId)
  const key = 'shown'

  t.equal(obm.getData(key), undefined)
  t.notOk(obm.getBool(key))
  t.notOk(obm.dataExists(key))

  obm.saveData(key, true)
  t.equal(obm.getData(key), 'true')
  t.notOk(obm.getBool(key))
  t.ok(obm.dataExists(key))

  obm = new OBM(7, userId)
  t.equal(obm.getData(key, undefined))
  t.notOk(obm.dataExists(key))
  t.notOk(obm.getBool(key))

  obm.saveBool(key, true)
  t.ok(obm.getBool(key))
  t.ok(obm.dataExists(key))

  t.end()
})

test('getGroupString', function (t) {
  const obm = new OBM(6, userId)

  obm.mock({nr: 6, included: true})
  t.equal(obm.getGroupString(), 'included')

  obm.mock({included: false})
  t.equal(obm.getGroupString(), 'excluded')

  t.end()
})

test('sendAction', function (t) {
  sinon.stub($, 'ajax')
  const obm = new OBM(nr, userId)
  obm.sendAction('seen', 3)
  t.equal($.ajax.callCount, 1)
  const callArgs = $.ajax.firstCall.args[0]
  t.equal(callArgs.data,
    '{"experiment_id":6,"key":"seen","value":"3"}')
  t.equal(callArgs.url,
    '/api/v9/obm/actions')
  $.ajax.restore()
  t.end()
})
