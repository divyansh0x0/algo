"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YArrayObj = void 0;
var YArrayObj = /** @class */ (function () {
    function YArrayObj(initialValues) {
        if (initialValues === void 0) { initialValues = []; }
        this.internal = initialValues;
    }
    YArrayObj.prototype.length = function () {
        return this.internal.length;
    };
    YArrayObj.prototype.get = function (index) {
        this.assertIndex(index);
        return this.internal[index];
    };
    YArrayObj.prototype.set = function (index, value) {
        this.assertIndex(index);
        this.internal[index] = value;
    };
    YArrayObj.prototype.push = function (value) {
        this.internal.push(value);
    };
    YArrayObj.prototype.pop = function () {
        if (this.internal.length === 0)
            throw new Error("Pop from empty array is not possible");
        return this.internal.pop();
    };
    YArrayObj.prototype.assertIndex = function (index) {
        if (index < 0 || index >= this.internal.length) {
            throw new Error("Index ".concat(index, " out of bounds"));
        }
    };
    YArrayObj.prototype.toString = function () {
        var str = "";
        for (var i = 0; i < this.internal.length; i++) {
            var valueWrapper = this.internal[i];
            str += ((valueWrapper === null || valueWrapper === void 0 ? void 0 : valueWrapper.value) || "null").toString();
            if (i < this.internal.length - 1) {
                str += ", ";
            }
        }
        return "[" + str + "]";
    };
    YArrayObj.prototype.getArray = function () {
        return __spreadArray([], this.internal, true);
    };
    YArrayObj.prototype.copy = function () {
        var arr = [];
        for (var _i = 0, _a = this.internal; _i < _a.length; _i++) {
            var el = _a[_i];
            arr.push(el.copy());
        }
        return new YArrayObj(arr);
    };
    return YArrayObj;
}());
exports.YArrayObj = YArrayObj;
