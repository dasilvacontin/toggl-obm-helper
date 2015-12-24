/* globals sessionStorage */

import { rtrim } from 'underscore.string'

let _apiToken = null

/**
 * Obtain the logged user's api_token from localStorage. It is cached into
 * memory.
 * @return {String} apiToken
 */
export function getAPIToken () : ?string {
  if (_apiToken != null) return _apiToken
  const rawData = sessionStorage.getItem('/api/v8/me')
  try {
    let userData = JSON.parse(rawData)
    _apiToken = userData.api_token
  } catch (e) {}
  return _apiToken
}

/**
 * Helper to use in ajax's beforeSend. It sets the 'Authorization' header
 * using the logged user's api_token.
 */
export function setAuthHeader (xhr) {
  const apiToken = getAPIToken()
  if (apiToken != null) {
    xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(`${apiToken}:api_token`))
  }
}

/**
 * Return the URL for an API endpoint.
 * @param {String} path
 * @param {Number} [v]
 * @return {String} apiUrl
 */
export function getAPIUrl (path: string, v: number = 8) {
  return rtrim(`/api/v${ v }/${ path }`, '/')
}
