'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * toggl-obm-helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2015 David da Silva
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

/* global $ */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var obmCache = {};

var OBMData = function () {
  function OBMData() {
    _classCallCheck(this, OBMData);

    this.included = false;
    this.actions = '';

    if (!(typeof this.actions === 'string')) {
      throw new TypeError('Value of "this.actions" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(this.actions));
    }

    this.fetched = false;
    this.fetchRequest = null;

    if (!(this.fetchRequest == null || this.fetchRequest instanceof _bluebird2.default)) {
      throw new TypeError('Value of "this.fetchRequest" violates contract.\n\nExpected:\n?Promise\n\nGot:\n' + _inspect(this.fetchRequest));
    }
  }

  _createClass(OBMData, [{
    key: 'update',
    value: function update(_ref2) {
      var included = _ref2.included;
      var actions = _ref2.actions;

      if (included != null) this.included = included;

      if (!(typeof this.included === 'boolean')) {
        throw new TypeError('Value of "this.included" violates contract.\n\nExpected:\nbool\n\nGot:\n' + _inspect(this.included));
      }

      if (actions != null) this.actions = actions;

      if (!(typeof this.actions === 'string')) {
        throw new TypeError('Value of "this.actions" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(this.actions));
      }

      this.fetched = true;
      this.fetchRequest = null;

      if (!(this.fetchRequest == null || this.fetchRequest instanceof _bluebird2.default)) {
        throw new TypeError('Value of "this.fetchRequest" violates contract.\n\nExpected:\n?Promise\n\nGot:\n' + _inspect(this.fetchRequest));
      }
    }
  }], [{
    key: 'getInstanceFor',
    value: function getInstanceFor(userId, nr) {
      function _ref(_id) {
        if (!(_id instanceof OBMData)) {
          throw new TypeError('Function return value violates contract.\n\nExpected:\nOBMData\n\nGot:\n' + _inspect(_id));
        }

        return _id;
      }

      if (!(typeof userId === 'number')) {
        throw new TypeError('Value of argument "userId" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(userId));
      }

      if (!(typeof nr === 'number')) {
        throw new TypeError('Value of argument "nr" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(nr));
      }

      var userData = obmCache[userId];
      if (!userData) {
        userData = {};
        obmCache[userId] = userData;
      }
      var obmData = userData[nr];
      if (!obmData) {
        obmData = new OBMData(nr);
        userData[nr] = obmData;
      }
      return _ref(obmData);
    }
  }]);

  return OBMData;
}();

var TogglOBMHelper = function () {
  function TogglOBMHelper(nr, userId) {
    var forceFetch = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, TogglOBMHelper);

    if (!(typeof nr === 'number')) {
      throw new TypeError('Value of argument "nr" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(nr));
    }

    if (!(typeof userId === 'number')) {
      throw new TypeError('Value of argument "userId" violates contract.\n\nExpected:\nnumber\n\nGot:\n' + _inspect(userId));
    }

    if (!(typeof forceFetch === 'boolean')) {
      throw new TypeError('Value of argument "forceFetch" violates contract.\n\nExpected:\nbool\n\nGot:\n' + _inspect(forceFetch));
    }

    this.nr = nr;
    this.userId = userId;
    this.obmData = OBMData.getInstanceFor(userId, nr);

    if (!(this.obmData instanceof OBMData)) {
      throw new TypeError('Value of "this.obmData" violates contract.\n\nExpected:\nOBMData\n\nGot:\n' + _inspect(this.obmData));
    }

    this.ready();
  }

  /**
   * Sets the data for the running OBM. This data should come from the server.
   * The OBMHelper instances check this data to know whether they are running,
   * or the logged user is included.
   */

  _createClass(TogglOBMHelper, [{
    key: 'mock',
    value: function mock(_ref3) {
      var included = _ref3.included;
      var actions = _ref3.actions;

      var mockData = new OBMData(this.obmData.nr);
      mockData.update({ included: included, actions: actions });
      for (var prop in arguments[0]) {
        if (!mockData.hasOwnProperty(prop)) {
          throw new Error('Can\'t mock property \'' + prop + '\'.');
        }
      }
      this.obmData = mockData;
    }
  }, {
    key: 'checkIsFetched',
    value: function checkIsFetched() {
      if (!this.obmData.fetched) {
        throw new Error('OBM ' + this.nr + ' data hasn\'t been fetched yet.');
      }
    }

    /**
     * Checks whether the user is in the `included` group of the experiment.
     * @return {Boolean} included
     */

  }, {
    key: 'isIncluded',
    value: function isIncluded() {
      this.checkIsFetched();
      return this.obmData.included;
    }

    /**
     * Checks whether the user is in the `excluded` group of the experiment.
     * @return {Boolean} excluded
     */

  }, {
    key: 'isExcluded',
    value: function isExcluded() {
      this.checkIsFetched();
      return !this.obmData.included;
    }

    /**
     * Checks if user action exists for the experiment. Used for workspace
     * specific experiments.
     * @param {String} action
     * @return {Boolean} exists
     */

  }, {
    key: 'getActionExists',
    value: function getActionExists(action) {
      this.checkIsFetched();
      var actions = this.obmData.actions.split(',');
      var exists = _lodash2.default.indexOf(actions, action) > -1;
      return exists;
    }

    /**
     * Returns the storage key for the data `key` for this experiment and user.
     * @param {String} key
     * @param {Number} [userId]
     * @return {String} storageKey
     */

  }, {
    key: 'getStorageKey',
    value: function getStorageKey(key) {
      return 'obm' + this.nr + '_' + key + '_' + this.userId;
    }

    /**
     * Storage-independent helpers for saving key-value data.
     */

  }, {
    key: 'getData',
    value: function getData(key) {
      var storageKey = this.getStorageKey(key);
      return $.cookie(storageKey);
    }
  }, {
    key: 'saveData',
    value: function saveData(key, value) {
      var storageKey = this.getStorageKey(key);
      $.cookie(storageKey, value, { path: '/', expires: 30 });
    }

    /**
     * For verbosity
     */

  }, {
    key: 'dataExists',
    value: function dataExists(key) {
      return this.getData(key) != null;
    }
  }, {
    key: 'getBool',
    value: function getBool(key) {
      var value = this.getData(key);
      return value === '1' || value === 'true';
    }
  }, {
    key: 'saveBool',
    value: function saveBool(key, bool) {
      this.saveData(key, bool && '1' || '0');
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

  }, {
    key: 'getGroupString',
    value: function getGroupString(extra) {
      this.checkIsFetched();
      var groupName = undefined;
      if (this.isIncluded() || extra) {
        groupName = 'included';
      } else {
        groupName = 'excluded';
      }
      return groupName;
    }

    /**
     * Record user action in the server's database.
     * @param {String} key
     * @param {String} [value], default to `true` for backwards compatibility
     */

  }, {
    key: 'sendAction',
    value: function sendAction(key) {
      var value = arguments.length <= 1 || arguments[1] === undefined ? 'true' : arguments[1];

      if (!(typeof key === 'string')) {
        throw new TypeError('Value of argument "key" violates contract.\n\nExpected:\nstring\n\nGot:\n' + _inspect(key));
      }

      value = String(value);
      var payload = { experiment_id: this.nr, key: key, value: value };
      $.ajax({
        beforeSend: _utils.setAuthHeader,
        contentType: 'application/json',
        data: JSON.stringify(payload),
        type: 'POST',
        url: (0, _utils.getAPIUrl)('obm/actions', 9)
      });
      if (!this.getActionExists(key)) {
        this.obmData.actions += ',' + key;
      }
    }

    /**
     * Invalidates cache and re-fetches OBM data. Returns a Promise that gets
     * fullfilled whenever the OBM data finishes fetching
     * @return {Promise}
     */

  }, {
    key: 'fetch',
    value: function fetch() {
      var _this = this;

      var fetchRequest = this.obmData.fetchRequest;
      if (fetchRequest == null) {
        fetchRequest = new _bluebird2.default(function (resolve, reject) {
          $.ajax({
            beforeSend: _utils.setAuthHeader,
            type: 'GET',
            url: (0, _utils.getAPIUrl)('me/experiments/web', 9),
            success: function success(_ref4) {
              var nr = _ref4.nr;
              var included = _ref4.included;
              var actions = _ref4.actions;

              if (nr === _this.nr) {
                _this.obmData.update({ included: included, actions: actions });
              } else {
                _this.obmData.fetched = true;
                _this.obmData.fetchRequest = null;
              }
              resolve(_this);
            },
            error: function error(err) {
              // In case data has been mocked or refetched, ignore failure
              if (_this.obmData.fetchRequest === fetchRequest) {
                _this.obmData.fetchRequest = null;
                reject(err);
              }
            }
          });
        });
        this.obmData.fetchRequest = fetchRequest;

        if (!(this.obmData.fetchRequest == null || this.obmData.fetchRequest instanceof _bluebird2.default)) {
          throw new TypeError('Value of "this.obmData.fetchRequest" violates contract.\n\nExpected:\n?Promise\n\nGot:\n' + _inspect(this.obmData.fetchRequest));
        }
      }
      return fetchRequest;
    }

    /**
     * Returns a Promise that gets fullfilled if the OBM data is already fetched
     * or whenever it finishes fetching.
     * @return {Promise}
     */

  }, {
    key: 'ready',
    value: function ready() {
      if (this.obmData.fetched) {
        return _bluebird2.default.resolve(this);
      }
      return this.fetch();
    }
  }]);

  return TogglOBMHelper;
}();

exports.default = TogglOBMHelper;

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

module.exports = exports['default'];