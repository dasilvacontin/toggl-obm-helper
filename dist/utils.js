'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* globals sessionStorage */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAPIToken = getAPIToken;
exports.setAuthHeader = setAuthHeader;
exports.getAPIUrl = getAPIUrl;

var _underscore = require('underscore.string');

var _apiToken = null;

/**
 * Obtain the logged user's api_token from localStorage. It is cached into
 * memory.
 * @return {String} apiToken
 */
function getAPIToken() {
  function _ref(_id) {
    if (!(_id == null || typeof _id === 'string')) {
      throw new TypeError('Function "getAPIToken" return value violates contract.\n\nExpected:\n?string\n\nGot:\n' + _inspect(_id));
    }

    return _id;
  }

  if (_apiToken != null) return _ref(_apiToken);
  var rawData = sessionStorage.getItem('/api/v8/me');
  try {
    var userData = JSON.parse(rawData);
    _apiToken = userData.api_token;
  } catch (e) {}
  return _ref(_apiToken);
}

/**
 * Helper to use in ajax's beforeSend. It sets the 'Authorization' header
 * using the logged user's api_token.
 */
function setAuthHeader(xhr) {
  var apiToken = getAPIToken();
  if (apiToken != null) {
    xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(apiToken + ':api_token'));
  }
}

/**
 * Return the URL for an API endpoint.
 * @param {String} path
 * @param {Number} [v]
 * @return {String} apiUrl
 */
function getAPIUrl(path) {
  var v = arguments.length <= 1 || arguments[1] === undefined ? 8 : arguments[1];

  if (!(typeof path === 'string')) {
    throw new TypeError('Value of argument "path" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(path));
  }

  if (!(typeof v === 'number')) {
    throw new TypeError('Value of argument "v" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(v));
  }

  return (0, _underscore.rtrim)('/api/v' + v + '/' + path, '/');
}

function _inspect(input) {
  if (input === null) {
    return 'null';
  } else if (input === undefined) {
    return 'void';
  } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return typeof input === 'undefined' ? 'undefined' : _typeof(input);
  } else if (Array.isArray(input)) {
    if (input.length > 0) {
      var first = _inspect(input[0]);

      if (input.every(function (item) {
        return _inspect(item) === first;
      })) {
        return first.trim() + '[]';
      } else {
        return '[' + input.map(_inspect).join(', ') + ']';
      }
    } else {
      return 'Array';
    }
  } else {
    var keys = Object.keys(input);

    if (!keys.length) {
      if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
        return input.constructor.name;
      } else {
        return 'Object';
      }
    }

    var entries = keys.map(function (key) {
      return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key]) + ';';
    }).join('\n  ');

    if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
      return input.constructor.name + ' {\n  ' + entries + '\n}';
    } else {
      return '{ ' + entries + '\n}';
    }
  }
}