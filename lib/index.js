/*
 * toggl-obm-helper
 *
 * Copyright (c) 2015 David da Silva
 * Licensed under the MIT license.
 */

/* global $ */

import _ from 'lodash'
import Promise from 'bluebird'
import {setAuthHeader, getAPIUrl} from './utils'

export default class TogglOBMHelper {

  constructor (nr: number, userId: number, forceFetch: boolean = false) {
    this.nr = nr
    this._user = userCache[userId]
    if (this._user == null) {
      this._user = {
        id: userId,
        nr: -1,
        included: false,
        actions: '',
        fetched: false,
        fetchRequest: null
      }
      userCache[userId] = this._user
    }
    this.ready()
  }

  /**
   * Sets the data for the running OBM. This data should come from the server.
   * The OBMHelper instances check this data to know whether they are running,
   * or the logged user is included.
   */
  mock ({nr, included, actions}) {
    if (nr != null) {
      if (typeof nr !== 'number') {
        throw new TypeError('Mocked `nr` should be a number')
      }
      this._user.nr = nr
    }
    if (included != null) {
      if (typeof included !== 'boolean') {
        throw new TypeError('Mocked `included` should be a boolean')
      }
      this._user.included = included
    }
    if (actions != null) {
      if (typeof actions !== 'string') {
        throw new TypeError('Mocked `actions` should be a string')
      }
      this._user.actions = actions
    }
    this._user.fetched = true
    this._user.fetchRequest = null
  }

  checkIsFetched () {
    if (!this._user.fetched) {
      throw new Error('OBMHelper didn\'t fetch user data yet.')
    }
  }

  /**
   * Checks whether the experiment is currently being allocated more users to.
   * @return {Boolean} running
   */
  isRunning () {
    this.checkIsFetched()
    return this.nr === this._user.nr
  }

  /**
   * Checks whether the user is in the `included` group of the experiment.
   * @return {Boolean} included
   */
  isIncluded () {
    this.checkIsFetched()
    return this.isRunning() && this._user.included === true
  }

  /**
   * Checks whether the user is in the `excluded` group of the experiment.
   * @return {Boolean} excluded
   */
  isExcluded () {
    this.checkIsFetched()
    return this.isRunning() && this._user.included === false
  }

  /**
   * Checks if user action exists for the experiment. Used for workspace
   * specific experiments.
   * @param {String} action
   * @return {Boolean} exists
   */
  getActionExists (action) {
    this.checkIsFetched()
    const actions = this._user.actions.split(',')
    const exists = _.indexOf(actions, action) > -1
    return exists
  }

  /**
   * Returns the storage key for the data `key` for this experiment and user.
   * @param {String} key
   * @param {Number} [userId]
   * @return {String} storageKey
   */
  getStorageKey (key) {
    return `obm${ this.nr }_${ key }_${ this._user.id }`
  }

  /**
   * Storage-independent helpers for saving key-value data.
   */
  getData (key) {
    const storageKey = this.getStorageKey(key)
    return $.cookie(storageKey)
  }
  saveData (key, value) {
    const storageKey = this.getStorageKey(key)
    $.cookie(storageKey, value, {path: '/', expires: 30})
  }

  /**
   * For verbosity
   */
  dataExists (key) {
    return this.getData(key) != null
  }
  getBool (key) {
    return this.getData(key) === '1'
  }
  saveBool (key, bool) {
    this.saveData(key, bool && '1' || '0')
  }

  /**
   * Get the name of the group in which the user is included.
   *
   * Returns:
   * - 'included' if the user is included in the experiment
   * - 'excluded' if the user is excluded in the experiment
   *
   * An optional parameter is used in the `if` logic, in case h4x are required.
   * Like saving in a cookie whether the user was previously participating in the
   * experiment. ¯_(ツ)_/¯
   */
  getGroupString (extra) {
    this.checkIsFetched()
    let groupName
    if (this.isIncluded() || extra) {
      groupName = 'included'
    } else {
      groupName = 'excluded'
    }
    return groupName
  }

  /**
   * Record user action in the server's database.
   * @param {String} key
   * @param {String} [value], default to `true` for backwards compatibility
   */
  sendAction (key: string, value = 'true') {
    value = String(value)
    const payload = { experiment_id: this.nr, key, value }
    $.ajax({
      beforeSend: setAuthHeader,
      contentType: 'application/json',
      data: JSON.stringify(payload),
      type: 'POST',
      url: getAPIUrl('obm/actions', 9)
    })
  }

  /**
   * Invalidates cache and re-fetches OBM data. Returns a Promise that gets
   * fullfilled whenever the OBM data finishes fetching
   * @return {Promise}
   */
  fetch () {
    let fetchRequest = this._user.fetchRequest
    if (fetchRequest == null) {
      fetchRequest = new Promise((resolve, reject) => {
        $.ajax({
          beforeSend: setAuthHeader,
          type: 'GET',
          url: getAPIUrl('me/experiments/web', 9),
          success: data => {
            this.mock(data)
            console.log(data)
            resolve(this)
          },
          error: err => {
            // In case data has been mocked or refetched, ignore failure
            if (this._user.fetchRequest === fetchRequest) {
              this._user.fetchRequest = null
              reject(err)
            }
          }
        })
      })
      this._user.fetchRequest = fetchRequest
    }
    return fetchRequest
  }

  /**
   * Returns a Promise that gets fullfilled if the OBM data is already fetched
   * or whenever it finishes fetching.
   * @return {Promise}
   */
  ready () {
    if (this._user.fetched) {
      return Promise.resolve(this)
    }
    return this.fetch()
  }
}

const userCache = {}
TogglOBMHelper.userCache = userCache
