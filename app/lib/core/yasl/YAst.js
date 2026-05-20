"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YProgram = exports.YValueType = exports.YNodeType = void 0;
var YNodeType;
(function (YNodeType) {
    YNodeType[YNodeType["EXP_PARAMETER"] = 0] = "EXP_PARAMETER";
    YNodeType[YNodeType["STMT_DEFAULT"] = 1] = "STMT_DEFAULT";
    YNodeType[YNodeType["EXP_IDENTIFIER"] = 2] = "EXP_IDENTIFIER";
    YNodeType[YNodeType["EXP_LITERAL"] = 3] = "EXP_LITERAL";
    YNodeType[YNodeType["EXP_CALL"] = 4] = "EXP_CALL";
    YNodeType[YNodeType["STMT_BREAK"] = 5] = "STMT_BREAK";
    YNodeType[YNodeType["STMT_CONTINUE"] = 6] = "STMT_CONTINUE";
    YNodeType[YNodeType["STMT_DECLARATION"] = 7] = "STMT_DECLARATION";
    YNodeType[YNodeType["EXP_ASSIGN"] = 8] = "EXP_ASSIGN";
    YNodeType[YNodeType["STMT_RETURN"] = 9] = "STMT_RETURN";
    YNodeType[YNodeType["STMT_FOR"] = 10] = "STMT_FOR";
    YNodeType[YNodeType["STMT_WHILE"] = 11] = "STMT_WHILE";
    YNodeType[YNodeType["STMT_THEN"] = 12] = "STMT_THEN";
    YNodeType[YNodeType["STMT_IF"] = 13] = "STMT_IF";
    YNodeType[YNodeType["STMT_ELSE"] = 14] = "STMT_ELSE";
    YNodeType[YNodeType["EXP_IF"] = 15] = "EXP_IF";
    YNodeType[YNodeType["STMT_SWITCH"] = 16] = "STMT_SWITCH";
    YNodeType[YNodeType["STMT_CASE"] = 17] = "STMT_CASE";
    YNodeType[YNodeType["EXP_BLOCK"] = 18] = "EXP_BLOCK";
    YNodeType[YNodeType["STMT_EXPRESSION"] = 19] = "STMT_EXPRESSION";
    YNodeType[YNodeType["EXP_BINARY"] = 20] = "EXP_BINARY";
    YNodeType[YNodeType["EXP_UNARY"] = 21] = "EXP_UNARY";
    YNodeType[YNodeType["EXP_PROPERTY_ACCESS"] = 22] = "EXP_PROPERTY_ACCESS";
    YNodeType[YNodeType["OP_TERNARY"] = 23] = "OP_TERNARY";
    YNodeType[YNodeType["OP_POSTFIX"] = 24] = "OP_POSTFIX";
    YNodeType[YNodeType["OP_INDEXING"] = 25] = "OP_INDEXING";
    YNodeType[YNodeType["DEF_ARRAY"] = 26] = "DEF_ARRAY";
    YNodeType[YNodeType["DEF_FUNCTION"] = 27] = "DEF_FUNCTION";
    YNodeType[YNodeType["STMT_ASSIGN"] = 28] = "STMT_ASSIGN";
})(YNodeType || (exports.YNodeType = YNodeType = {}));
var YValueType;
(function (YValueType) {
    YValueType[YValueType["string"] = 0] = "string";
    YValueType[YValueType["number"] = 1] = "number";
    YValueType[YValueType["boolean"] = 2] = "boolean";
    YValueType[YValueType["queue"] = 3] = "queue";
    YValueType[YValueType["set"] = 4] = "set";
    YValueType[YValueType["array"] = 5] = "array";
    YValueType[YValueType["function_signature"] = 6] = "function_signature";
    YValueType[YValueType["unset"] = 7] = "unset";
})(YValueType || (exports.YValueType = YValueType = {}));
var YProgram = /** @class */ (function () {
    function YProgram() {
        this.statements = [];
    }
    YProgram.prototype.getStatements = function () {
        return this.statements;
    };
    YProgram.prototype.addStatement = function (node) {
        this.statements.push(node);
    };
    return YProgram;
}());
exports.YProgram = YProgram;
