"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YNativeValueWrapper = void 0;
var YArrayObj_1 = require("./YArrayObj");
var YNativeValueWrapper = /** @class */ (function () {
    function YNativeValueWrapper(value) {
        this.value = value;
    }
    YNativeValueWrapper.prototype.isNull = function () {
        return this.value === null;
    };
    YNativeValueWrapper.prototype.isNumber = function () {
        return typeof this.value === "number";
    };
    YNativeValueWrapper.prototype.isString = function () {
        return typeof this.value === "string";
    };
    YNativeValueWrapper.prototype.isArray = function () {
        return this.value instanceof YArrayObj_1.YArrayObj;
    };
    YNativeValueWrapper.prototype.isBoolean = function () {
        return typeof this.value === "boolean";
    };
    YNativeValueWrapper.prototype.copy = function () {
        if (!this.isArray())
            return new YNativeValueWrapper(this.value);
        else
            return new YNativeValueWrapper(this.value.copy());
    };
    YNativeValueWrapper.NULL = new YNativeValueWrapper(null);
    return YNativeValueWrapper;
}());
exports.YNativeValueWrapper = YNativeValueWrapper;
