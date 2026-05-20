"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineMap = void 0;
var LineMap = /** @class */ (function () {
    function LineMap() {
        this.LineMap = [];
    }
    LineMap.prototype.push = function (pos) {
        this.LineMap.push(pos);
    };
    LineMap.prototype.getLine = function (pos) {
        var low = 0;
        var high = this.LineMap.length - 1;
        while (low <= high) {
            var mid = Math.floor((low + high) / 2);
            if (this.LineMap[mid] <= pos) {
                low = mid + 1;
            }
            else {
                high = mid - 1;
            }
        }
        return high + 1; // 1-based line number
    };
    LineMap.prototype.indexToLineCol = function (offset) {
        var line = this.getLine(offset);
        var col = offset - this.LineMap[line];
        return [line, col];
    };
    return LineMap;
}());
exports.LineMap = LineMap;
