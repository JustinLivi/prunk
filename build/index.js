"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var util_1 = require("util");
/**
 * Utility method for transforming [string, Promise<T>] to Promise<[string, T]>
 * @param tuple the key of a map with a promise
 */
exports.fromPromiseTuple = function (_a) {
    var key = _a[0], promise = _a[1];
    return __awaiter(_this, void 0, void 0, function () { var _b; return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = [key];
                return [4 /*yield*/, promise];
            case 1: return [2 /*return*/, _b.concat([_c.sent()])];
        }
    }); });
};
/**
 * Utility method for transforming Dictionary<Promise<T>> to Promise<Dictionary<T>>
 * @param dictionary the dictionary of promises
 */
exports.awaitMap = function (dictionary) { return __awaiter(_this, void 0, void 0, function () {
    var pairs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(lodash_1.map(lodash_1.toPairs(dictionary), exports.fromPromiseTuple))];
            case 1:
                pairs = _a.sent();
                return [2 /*return*/, lodash_1.fromPairs(pairs)];
        }
    });
}); };
/**
 * Returns a function which can be used to evaluate prunks
 * @param props The properties to pass to prunkFuncs
 */
exports.unprunkWithProps = function (props) {
    /**
     * Evaluate a prunk based on the enclosed props
     * @param prunk The prunk to evaluate
     */
    return function (prunk) { return __awaiter(_this, void 0, void 0, function () {
        var value, _a, _b, unprunk, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    if (!(typeof prunk === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, prunk(props)];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 6];
                case 2:
                    if (!(typeof prunk === 'object' && prunk instanceof Promise)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prunk];
                case 3:
                    _b = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _b = prunk;
                    _c.label = 5;
                case 5:
                    _a = _b;
                    _c.label = 6;
                case 6:
                    value = _a;
                    unprunk = exports.unprunkWithProps(props);
                    return [2 /*return*/, util_1.isArray(value)
                            ? Promise.all(lodash_1.map(value, unprunk))
                            : (typeof value === 'object'
                                ? exports.awaitMap(lodash_1.mapValues(value, unprunk))
                                : value)];
                case 7:
                    error_1 = _c.sent();
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    }); };
};
//# sourceMappingURL=index.js.map