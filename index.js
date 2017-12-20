module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectID = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bson = __webpack_require__(1);

var _sift2 = __webpack_require__(2);

var _sift3 = _interopRequireDefault(_sift2);

var _bluebird = __webpack_require__(3);

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.ObjectID = _bson.ObjectID;

var ReactLocalMongoose = function () {
  function ReactLocalMongoose(schema, tableName) {
    _classCallCheck(this, ReactLocalMongoose);

    this.tableName = tableName;
    this.schema = schema;
    localStorage[this.tableName.toLowerCase()] = localStorage[this.tableName.toLowerCase()] || '[]';
    this.data = this.getCollection();
  }

  // get collection from localStorage and convert from JSON


  _createClass(ReactLocalMongoose, [{
    key: 'getCollection',
    value: function getCollection() {
      var tableName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.tableName;

      return JSON.parse(localStorage[tableName.toLowerCase()]);
    }

    // convert collection to JSON and set in localStorage

  }, {
    key: 'setCollection',
    value: function setCollection(collection) {
      localStorage[this.tableName.toLowerCase()] = JSON.stringify(collection);
      return collection;
    }

    // populate references

  }, {
    key: 'populate',
    value: function populate(records) {
      var _this = this;

      var isArray = records instanceof Array;
      // if records is not an array, put it in an array to normalize the following functionality
      records = isArray ? records : [records];

      // grab the collection that we'll be needing for populaton
      var foreignCollections = {};
      for (var path in this.schema) {
        var _ref = this.schema[path] instanceof Array ? this.schema[path][0] : this.schema[path],
            ref = _ref.ref;

        if (ref) foreignCollections[path] = this.getCollection(ref);
      }

      // replace the references with records
      records = records.map(function (record) {
        var _loop = function _loop(_path) {
          if (_this.schema[_path] instanceof Array) {
            // if the path is an array in the schema, return an array of all matching foreign records
            record[_path] = foreignCollections[_path].filter(function (foreignRecord) {
              return record[_path].includes(foreignRecord._id);
            });
          } else {
            // otherwise just match by _id
            record[_path] = foreignCollections[_path].find(function (foreignRecord) {
              return foreignRecord._id === record[_path];
            });
          }
        };

        for (var _path in foreignCollections) {
          _loop(_path);
        }
        return record;
      });

      return isArray ? records : records[0];
    }

    // convert embedded documents to ids
    // this allows users send an entire document to the database, but only the id will be stored

  }, {
    key: 'convertDocsToRefs',
    value: function convertDocsToRefs(data) {
      for (var path in this.schema) {
        // if the data is an object, replace it with object._id
        if (this.schema[path].type === _bson.ObjectID) {
          if (data[path]) data[path] = data[path]._id || data[path];else delete data[path];
        }

        // if the data is an array, create an array of object._id and remove falsey values
        if (this.schema[path] instanceof Array && this.schema[path][0].type === _bson.ObjectID) {
          data[path] = data[path].map(function (record) {
            return record._id || record;
          }).filter(function (id) {
            return !!id;
          });
        }
      }

      return data;
    }

    // validate the data

  }, {
    key: 'validate',
    value: function validate(data) {
      data = this.convertDocsToRefs(data);
      var errors = {};

      // remove data not in schema
      for (var path in data) {
        if (!this.schema[path] && path !== '_id') delete data[path];
      }for (var _path2 in this.schema) {
        var _ref2 = this.schema[_path2] instanceof Array ? this.schema[_path2][0] : this.schema[_path2],
            ref = _ref2.ref,
            type = _ref2.type,
            required = _ref2.required,
            unique = _ref2.unique;

        var value = data[_path2];

        // required
        if (required && !value) {
          var message = typeof required === 'string' ? required : 'Path `' + _path2 + '` is required.';
          Object.assign(errors, _defineProperty({}, _path2, { required: message }));
        }

        // unique
        if (unique && value) {
          var _message = typeof required === 'string' ? unique : 'Path `' + _path2 + '` must be unique.';
          var dupes = (0, _sift3.default)(_defineProperty({}, _path2, value), this.getCollection());
          if (dupes.length && dupes[0]._id !== data._id) Object.assign(errors, _defineProperty({}, _path2, { unique: _message }));
        }

        // coerce the data to the type specified in the schema
        if (type === Date) {
          // attempt to convert the date to an ISO string
          try {
            data[_path2] = new Date(value).toISOString();
          } catch (e) {
            // if the date is invalid, update the errors
            Object.assign({}, errors, _defineProperty({}, _path2, { type: 'Invalid date' }));
          }
        } else if (type !== _bson.ObjectID) {
          // `type` is a constructor fuction set in the schema (String, Number etc.)
          data[_path2] = type(value);
        }
      }

      return new _bluebird2.default(function (resolve, reject) {
        // if the validations have failed reject the promise with an error
        if (Object.keys(errors).length) {
          var err = new Error('Validation Failed');
          err.errors = errors;
          return reject(err);
        }

        // otherwise resolve with the data
        return resolve(data);
      });
    }

    // create records

  }, {
    key: 'create',
    value: function create() {
      var _this2 = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var collection = this.getCollection();

      // if the data is not an array, put it in an array to normalize the following functionality
      if (!(data instanceof Array)) data = [data];

      // create an array of validation promises for the array of data
      var validations = data.map(function (data) {
        // create an id for each record
        data._id = data._id || (0, _bson.ObjectID)().toString();
        return _this2.validate(data);
      });

      // once the validations have passed, store the data in localStorage
      return _bluebird2.default.all(validations).then(function (data) {
        _this2.setCollection(collection.concat(data));
        return data.length === 1 ? data[0] : data;
      });
    }
  }, {
    key: 'makeQuery',
    value: function makeQuery(query) {
      // get all the records
      var collection = this.getCollection();
      // if there is a query, use sift to find the matched records, otherwise return the entire collection
      return query ? (0, _sift3.default)(query, collection) : collection;
    }

    // find a record

  }, {
    key: 'find',
    value: function find() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var records = this.populate(this.makeQuery(query));
      return _bluebird2.default.resolve(records);
    }

    // find a single record

  }, {
    key: 'findOne',
    value: function findOne() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var record = this.populate(this.makeQuery(query)[0]);
      return _bluebird2.default.resolve(record);
    }

    // find a record by id

  }, {
    key: 'findById',
    value: function findById(id) {
      if (!id) throw new Error('ID required');
      return this.findOne({ _id: id });
    }

    // update records

  }, {
    key: 'update',
    value: function update() {
      var _this3 = this;

      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var data = arguments[1];

      // get the collection and find the matching records using sift
      var collection = this.getCollection();
      var records = (0, _sift3.default)(query, collection);

      // update the records with the new data, then validate
      var promises = records.map(function (record) {
        Object.assign(record, data);
        return _this3.validate(record);
      });

      // once updated data is validated, persist to localStorage and return the updated records
      return _bluebird2.default.all(promises).then(function () {
        _this3.setCollection(collection);
        return records;
      });
    }

    // update a single record by id

  }, {
    key: 'findOneAndUpdate',
    value: function findOneAndUpdate() {
      var _this4 = this;

      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var data = arguments[1];

      // get the collection and find the matching records using sift
      var collection = this.getCollection();
      var record = (0, _sift3.default)(query, collection)[0];
      // update the records with the new data, then validate
      Object.assign(record, data);
      return this.validate(record).then(function () {
        // once updated data is validated, persist to localStorage and return the updated records
        _this4.setCollection(collection);
        return record;
      });
    }

    // update a single record by id

  }, {
    key: 'findByIdAndUpdate',
    value: function findByIdAndUpdate(id, data) {
      if (!id) throw new Error('ID required');
      return this.findOneAndUpdate({ _id: id }, data);
    }

    // remove records

  }, {
    key: 'remove',
    value: function remove() {
      var _this5 = this;

      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // et the collection and find the matching records using sift
      var collection = this.getCollection();
      var records = (0, _sift3.default)(query, collection);

      // remove each matching record from the collection
      records.forEach(function (record) {
        var index = collection.indexOf(record);
        collection.splice(index, 1);
      });

      // persist the updated collection to localStorage
      return new _bluebird2.default(function (resolve) {
        _this5.setCollection(collection);
        return resolve(null);
      });
    }
  }, {
    key: 'findOneAndRemove',
    value: function findOneAndRemove() {
      var _this6 = this;

      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // et the collection and find the matching records using sift
      var collection = this.getCollection();
      var record = (0, _sift3.default)(query, collection)[0];

      // remove each matching record from the collection
      var index = collection.indexOf(record);
      collection.splice(index, 1);

      // persist the updated collection to localStorage
      return new _bluebird2.default(function (resolve) {
        _this6.setCollection(collection);
        return resolve(null);
      });
    }

    // remove a record by id

  }, {
    key: 'findByIdAndRemove',
    value: function findByIdAndRemove(id) {
      if (!id) throw new Error('ID required');
      return this.remove({ _id: id });
    }

    // re-set the collection to an empty array

  }, {
    key: 'drop',
    value: function drop() {
      this.setCollection([]);
      return true;
    }
  }]);

  return ReactLocalMongoose;
}();

exports.default = ReactLocalMongoose;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("bson");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("sift");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ })
/******/ ]);