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

const obmCache = {}

class OBMData {
  included: boolean;
  actions: string;
  fetched: boolean;
  fetchRequest: ?Promise;

  constructor () {
    this.included = false
    this.actions = ''
    this.fetched = false
    this.fetchRequest = null
  }

  update ({included, actions}) {
    if (included != null) this.included = included
    if (actions != null) this.actions = actions
    this.fetched = true
    this.fetchRequest = null
  }

  static getInstanceFor (userId: number, nr: number) : OBMData {
    let userData = obmCache[userId]
    if (!userData) {
      userData = {}
      obmCache[userId] = userData
    }
    let obmData = userData[nr]
    if (!obmData) {
      obmData = new OBMData(nr)
      userData[nr] = obmData
    }
    return obmData
  }
}

export default class TogglOBMHelper {
  nr: number;
  userId: number;
  obmData: OBMData;

  constructor (nr: number, userId: number, forceFetch: boolean = false) {
    this.nr = nr
    this.userId = userId
    this.obmData = OBMData.getInstanceFor(userId, nr)
    this.ready()
  }

  /**
   * Sets the data for the running OBM. This data should come from the server.
   * The OBMHelper instances check this data to know whether they are running,
   * or the logged user is included.
   */
  mock ({included, actions}) {
    var mockData = new OBMData(this.obmData.nr)
    mockData.update({included, actions})
    for (var prop in arguments[0]) {
      if (!mockData.hasOwnProperty(prop)) {
        throw new Error(`Can't mock property '${prop}'.`)
      }
    }
    this.obmData = mockData
  }

  checkIsFetched () {
    if (!this.obmData.fetched) {
      throw new Error(`OBM ${this.nr} data hasn't been fetched yet.`)
    }
  }

  /**
   * Checks whether the user is in the `included` group of the experiment.
   * @return {Boolean} included
   */
  isIncluded () {
    this.checkIsFetched()
    return this.obmData.included === true
  }

  /**
   * Checks whether the user is in the `excluded` group of the experiment.
   * @return {Boolean} excluded
   */
  isExcluded () {
    this.checkIsFetched()
    return this.obmData.included === false
  }

  /**
   * Checks if user action exists for the experiment. Used for workspace
   * specific experiments.
   * @param {String} action
   * @return {Boolean} exists
   */
  getActionExists (action) {
    this.checkIsFetched()
    const actions = this.obmData.actions.split(',')
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
    return `obm${ this.nr }_${ key }_${ this.userId }`
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
    if (!this.getActionExists(key)) {
      this.obmData.actions += `,${key}`
    }
  }

  /**
   * Invalidates cache and re-fetches OBM data. Returns a Promise that gets
   * fullfilled whenever the OBM data finishes fetching
   * @return {Promise}
   */
  fetch () {
    let fetchRequest = this.obmData.fetchRequest
    if (fetchRequest == null) {
      fetchRequest = new Promise((resolve, reject) => {
        $.ajax({
          beforeSend: setAuthHeader,
          type: 'GET',
          url: getAPIUrl('me/experiments/web', 9),
          success: ({nr, included, actions }) => {
            if (nr === this.nr) {
              this.obmData.update({ included, actions })
            } else {
              this.obmData.fetched = true
              this.obmData.fetchRequest = null
            }
            resolve(this)
          },
          error: err => {
            // In case data has been mocked or refetched, ignore failure
            if (this.obmData.fetchRequest === fetchRequest) {
              this.obmData.fetchRequest = null
              reject(err)
            }
          }
        })
      })
      this.obmData.fetchRequest = fetchRequest
    }
    return fetchRequest
  }

  /**
   * Returns a Promise that gets fullfilled if the OBM data is already fetched
   * or whenever it finishes fetching.
   * @return {Promise}
   */
  ready () {
    if (this.obmData.fetched) {
      return Promise.resolve(this)
    }
    return this.fetch()
  }
}
