/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var _extendStatics = function extendStatics(d, b) {
  _extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };
  return _extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  _extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var _assign = function __assign() {
  _assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return _assign.apply(this, arguments);
};
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var fs = require('fs');
var Temp = /** @class */ (function () {
    function Temp(props) {
        this._$id = props._$id || +new Date;
        this._$status = props._$id ? props._$status : 1;
        this.content = props._$id ? props.content : props;
    }
    return Temp;
}());
var FileHander = /** @class */ (function () {
    function FileHander(props) {
        var _this = this;
        this._copyFile = function (source, target) {
            return new Promise(function (resolve, reject) {
                // 使用回调函数的方式
                fs.copyFile(source, target, function (error) {
                    if (error) {
                        resolve({ code: 500, error: error });
                    }
                    else {
                        resolve({ code: 200 });
                    }
                });
            });
        };
        this._unlinkFile = function (target) {
            return new Promise(function (resolve, reject) {
                // 使用回调函数的方式
                fs.unlink(target, function (error) {
                    if (error) {
                        resolve({ code: 500, error: error });
                    }
                    else {
                        resolve({ code: 200 });
                    }
                });
            });
        };
        this._readDatabase = function (options) {
            if (options === void 0) { options = {}; }
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var docs, file, json, files, i, docString, json, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            docs = [];
                            if (!options._$id) return [3 /*break*/, 2];
                            console.log('_readDatabase: ', "".concat(this.databasePath).concat(options._$id, ".json"));
                            return [4 /*yield*/, fs.readFileSync("".concat(this.databasePath).concat(options._$id, ".json"))];
                        case 1:
                            file = _a.sent();
                            json = JSON.parse(file);
                            if (json._$status) {
                                docs.push(json);
                            }
                            return [3 /*break*/, 7];
                        case 2: return [4 /*yield*/, fs.readdirSync(this.databasePath)];
                        case 3:
                            files = _a.sent();
                            console.log('files: ', files);
                            i = 0;
                            _a.label = 4;
                        case 4:
                            if (!(i < files.length)) return [3 /*break*/, 7];
                            return [4 /*yield*/, fs.readFileSync("".concat(this.databasePath, "/").concat(files[i]))];
                        case 5:
                            docString = _a.sent();
                            json = JSON.parse(docString);
                            if (json._$status) {
                                docs.push(json);
                            }
                            _a.label = 6;
                        case 6:
                            i++;
                            return [3 /*break*/, 4];
                        case 7:
                            resolve({ code: 200, data: docs });
                            return [3 /*break*/, 9];
                        case 8:
                            error_1 = _a.sent();
                            resolve({ code: 500, error: error_1 });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
        };
        this._writeDatabase = function (data, options) {
            if (options === void 0) { options = {}; }
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var doc, filename, filenameCopy, copyResult, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            doc = new Temp(data);
                            filename = "".concat(this.databasePath).concat(doc._$id, ".json");
                            filenameCopy = "".concat(this.databasePath).concat(doc._$id, "_copy.json");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 8]);
                            if (!options.copy) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._copyFile(filename, filenameCopy)];
                        case 2:
                            copyResult = _a.sent();
                            if (copyResult.code !== 200)
                                return [2 /*return*/, resolve(copyResult)];
                            _a.label = 3;
                        case 3:
                            fs.writeFileSync(filename, JSON.stringify(doc, null, 2));
                            if (options.copy) {
                                // 删除备份
                                this._unlinkFile(filenameCopy);
                            }
                            resolve({ code: 200, doc: doc });
                            return [3 /*break*/, 8];
                        case 4:
                            error_2 = _a.sent();
                            if (!options.copy) return [3 /*break*/, 7];
                            // 如果失败，复原文件
                            return [4 /*yield*/, this._copyFile(filenameCopy, filename)];
                        case 5:
                            // 如果失败，复原文件
                            _a.sent();
                            return [4 /*yield*/, this._unlinkFile(filenameCopy)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7:
                            resolve({ code: 500, error: error_2 });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
        };
        var rootPath = props.base || process.cwd();
        this.model = props.model;
        this.databasePath = "".concat(rootPath, "/data/").concat(this.model, "/");
        if (!this.model) {
            console.error('model 不能为空！');
        }
        // 检查文件夹是否存在
        if (!fs.existsSync(this.databasePath)) {
            // 如果不存在，则创建该文件夹
            fs.mkdirSync(this.databasePath, { recursive: true });
            console.log("".concat(this.databasePath, " \u5DF2\u521B\u5EFA"));
        }
        else {
            console.log("".concat(this.databasePath, " \u5DF2\u5B58\u5728"));
        }
    }
    return FileHander;
}());

var DB = /** @class */ (function (_super) {
    __extends(DB, _super);
    function DB(props) {
        var _this = _super.call(this, props) || this;
        _this.create = function (data) {
            return _this._writeDatabase(data);
        };
        _this.find = function (params_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([params_1], args_1, true), void 0, function (params, options) {
                var _a, skip, _b, limit, _c, sort, query, result, list, docs, resultDocs, len, i;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = options.skip, skip = _a === void 0 ? 0 : _a, _b = options.limit, limit = _b === void 0 ? 10000 : _b, _c = options.sort, sort = _c === void 0 ? -1 : _c;
                            query = Object.keys(params).reduce(function (obj, key) {
                                if (params[key] !== undefined) {
                                    obj[key] = params[key];
                                }
                                return obj;
                            }, {});
                            return [4 /*yield*/, this._readDatabase(query)];
                        case 1:
                            result = _d.sent();
                            if (result.code !== 200)
                                return [2 /*return*/, result];
                            // 没有查询条件时，返回所有数据
                            if (query === undefined)
                                return [2 /*return*/, result];
                            list = result.data;
                            if (typeof query !== 'object')
                                return [2 /*return*/, { code: 500, error: '数据不存在！' }];
                            docs = list.filter(function (item) { return Object.keys(query).every(function (key) {
                                // 复杂筛选使用函数判断
                                if (typeof query[key] === 'function')
                                    return query[key](item.content[key]);
                                // 默认判断锚定字段值是否相等
                                return query[key] === item.content[key];
                            }); }).sort(function (a, b) { return sort > 0 ? a._$id - b._$id : b._$id - a._$id; });
                            resultDocs = [];
                            if (skip || limit) {
                                len = docs.length >= ((+skip) + (+limit)) ? (+limit) : (docs.length % (+limit));
                                for (i = skip; i < skip + len; i++) {
                                    if (docs[i]) {
                                        resultDocs.push(docs[i]);
                                    }
                                }
                            }
                            // console.log('resultDocs: ', resultDocs)
                            return [2 /*return*/, {
                                    code: result.code,
                                    data: resultDocs,
                                    count: docs.length
                                }];
                    }
                });
            });
        };
        _this.findOne = function (query_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([query_1], args_1, true), void 0, function (query, options) {
                var result, data;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.find(query, options)];
                        case 1:
                            result = _a.sent();
                            if (result.code !== 200)
                                return [2 /*return*/, result];
                            data = result.data[0];
                            return [2 /*return*/, {
                                    code: 200,
                                    data: data && _assign(_assign({}, data.content), { _$id: data._$id }),
                                    count: result.count
                                }];
                    }
                });
            });
        };
        _this.findAll = function (query_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([query_1], args_1, true), void 0, function (query, options) {
                var result;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.find(query, options)];
                        case 1:
                            result = _a.sent();
                            if (result.code !== 200)
                                return [2 /*return*/, result];
                            return [2 /*return*/, {
                                    code: 200,
                                    data: result.data.map(function (item) { return (_assign(_assign({}, item.content), { _$id: item._$id })); }),
                                    count: result.count
                                }];
                    }
                });
            });
        };
        _this.updateOne = function (target, source) { return __awaiter(_this, void 0, void 0, function () {
            var options, result, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = source || target;
                        if (!target._$id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._readDatabase(target)];
                    case 1:
                        result = _a.sent();
                        delete target._$id;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.find(options, {})];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (result.code !== 200)
                            return [2 /*return*/, result];
                        item = result.data[0];
                        if (!item)
                            return [2 /*return*/, { code: 500, error: '数据不存在！' }];
                        item.content = _assign(_assign({}, item.content), target);
                        return [2 /*return*/, this._writeDatabase(item, { copy: true })];
                }
            });
        }); };
        _this.updateAll = function (target, source) { return __awaiter(_this, void 0, void 0, function () {
            var options, result, newList, errlist, i, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = source || target;
                        return [4 /*yield*/, this.find(options, {})];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 200)
                            return [2 /*return*/, result];
                        newList = result.data.map(function (item) { return (_assign(_assign({}, item), { content: _assign(_assign({}, item.content), target) })); });
                        errlist = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < newList.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._writeDatabase(newList[i], { copy: true })];
                    case 3:
                        item = _a.sent();
                        if (item.code !== 200) {
                            errlist.push(item);
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            code: 200,
                            status: !errlist.length,
                            errlist: errlist
                        }];
                }
            });
        }); };
        _this.removeOne = function (query_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([query_1], args_1, true), void 0, function (query, options) {
                var result, item;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!query._$id) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._readDatabase(query)];
                        case 1:
                            result = _a.sent();
                            delete query._$id;
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.find(query, options)];
                        case 3:
                            result = _a.sent();
                            _a.label = 4;
                        case 4:
                            if (result.code !== 200)
                                return [2 /*return*/, result];
                            item = result.data[0];
                            if (!item)
                                return [2 /*return*/, { code: 500, error: '数据不存在！' }];
                            item._$status = 0;
                            return [2 /*return*/, this._writeDatabase(item, { copy: true })];
                    }
                });
            });
        };
        _this.removeAll = function (query) { return __awaiter(_this, void 0, void 0, function () {
            var result, newList, errlist, i, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find(query)];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 200)
                            return [2 /*return*/, result];
                        newList = result.data.map(function (item) { return (_assign(_assign({}, item), { _$status: 0 })); });
                        errlist = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < newList.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._writeDatabase(newList[i], { copy: true })];
                    case 3:
                        item = _a.sent();
                        if (item.code !== 200) {
                            errlist.push(item);
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, {
                            code: 200,
                            status: !errlist.length,
                            errlist: errlist
                        }];
                }
            });
        }); };
        _this._id = +new Date;
        return _this;
    }
    return DB;
}(FileHander));
module.exports = DB;
//# sourceMappingURL=index.esm.js.map
