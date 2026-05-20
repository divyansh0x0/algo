"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTypeToken = parseTypeToken;
exports.isOperator = isOperator;
exports.getBindingPower = getBindingPower;
exports.isAssignmentOperator = isAssignmentOperator;
exports.getAugmentedAssignmentOperatorToken = getAugmentedAssignmentOperatorToken;
exports.isPostfixOperator = isPostfixOperator;
exports.isExpressionTerminator = isExpressionTerminator;
var YAst_1 = require("../YAst");
var YToken_1 = require("../YToken");
function parseTypeToken(token) {
    switch (token.lexeme) {
        case "string":
            return YAst_1.YValueType.string;
        case "int":
            return YAst_1.YValueType.number;
        case "Set":
            return YAst_1.YValueType.set;
        case "Queue":
            return YAst_1.YValueType.queue;
        case "Function":
            return YAst_1.YValueType.function_signature;
        default:
            return null;
    }
}
function isOperator(token) {
    if (!token)
        return false;
    switch (token.type) {
        case YToken_1.YTokenType.LPAREN:
        case YToken_1.YTokenType.LBRACKET:
        case YToken_1.YTokenType.DOT:
        case YToken_1.YTokenType.MODULO:
        case YToken_1.YTokenType.MULTIPLY:
        case YToken_1.YTokenType.DIVIDE:
        case YToken_1.YTokenType.PLUS:
        case YToken_1.YTokenType.MINUS:
        case YToken_1.YTokenType.POWER:
        case YToken_1.YTokenType.INLINE_ASSIGN:
        case YToken_1.YTokenType.DECREMENT:
        case YToken_1.YTokenType.INCREMENT:
        case YToken_1.YTokenType.LESS_THAN:
        case YToken_1.YTokenType.LESS_THAN_EQUAL_TO:
        case YToken_1.YTokenType.GREATER_THAN:
        case YToken_1.YTokenType.GREATER_THAN_EQUAL_TO:
        case YToken_1.YTokenType.EQUAL_EQUAL:
        case YToken_1.YTokenType.NOT_EQUAL:
        case YToken_1.YTokenType.BIT_AND:
        case YToken_1.YTokenType.BIT_OR:
        case YToken_1.YTokenType.BIT_NOT:
        case YToken_1.YTokenType.BIT_SHIFT_LEFT:
        case YToken_1.YTokenType.BIT_SHIFT_RIGHT:
        case YToken_1.YTokenType.BIT_XOR:
        case YToken_1.YTokenType.NOT:
        case YToken_1.YTokenType.OR:
        case YToken_1.YTokenType.AND:
        case YToken_1.YTokenType.NEGATE:
            return true;
        default:
            return false;
    }
}
function getBindingPower(token_type) {
    //right associative has lower right power while left associative has lower left power
    switch (token_type) {
        case YToken_1.YTokenType.DOT:
            return [120, 121];
        case YToken_1.YTokenType.LPAREN:
        case YToken_1.YTokenType.LBRACKET:
            return [110, 111];
        case YToken_1.YTokenType.INCREMENT:
        case YToken_1.YTokenType.DECREMENT:
            return [100, -1];
        case YToken_1.YTokenType.POWER:
            return [90, 89];
        case YToken_1.YTokenType.MULTIPLY:
        case YToken_1.YTokenType.MODULO:
        case YToken_1.YTokenType.DIVIDE:
            return [80, 81];
        case YToken_1.YTokenType.BIT_AND:
        case YToken_1.YTokenType.BIT_OR:
        case YToken_1.YTokenType.BIT_XOR:
        case YToken_1.YTokenType.BIT_NOT:
            return [70, 71];
        case YToken_1.YTokenType.BIT_SHIFT_LEFT:
        case YToken_1.YTokenType.BIT_SHIFT_RIGHT:
            return [60, 61];
        case YToken_1.YTokenType.PLUS:
        case YToken_1.YTokenType.MINUS:
            return [50, 51];
        case YToken_1.YTokenType.LESS_THAN:
        case YToken_1.YTokenType.LESS_THAN_EQUAL_TO:
        case YToken_1.YTokenType.GREATER_THAN:
        case YToken_1.YTokenType.GREATER_THAN_EQUAL_TO:
            return [40, 41];
        case YToken_1.YTokenType.EQUAL_EQUAL:
        case YToken_1.YTokenType.NOT_EQUAL:
            return [30, 31];
        case YToken_1.YTokenType.AND:
            return [20, 21];
        case YToken_1.YTokenType.OR:
            return [10, 11];
        case YToken_1.YTokenType.INLINE_ASSIGN:
            return [1, 0];
        default:
            return null;
    }
}
function isAssignmentOperator(type) {
    switch (type) {
        case YToken_1.YTokenType.ASSIGN:
        case YToken_1.YTokenType.MULTIPLY_ASSIGN:
        case YToken_1.YTokenType.DIVIDE_ASSIGN:
        case YToken_1.YTokenType.MOD_ASSIGN:
        case YToken_1.YTokenType.POW_ASSIGN:
        case YToken_1.YTokenType.PLUS_ASSIGN:
        case YToken_1.YTokenType.MINUS_ASSIGN:
            return true;
        default:
            return false;
    }
}
function getAugmentedAssignmentOperatorToken(type) {
    switch (type) {
        case YToken_1.YTokenType.MULTIPLY_ASSIGN:
            return YToken_1.YTokenType.MULTIPLY;
        case YToken_1.YTokenType.DIVIDE_ASSIGN:
            return YToken_1.YTokenType.DIVIDE;
        case YToken_1.YTokenType.MOD_ASSIGN:
            return YToken_1.YTokenType.MODULO;
        case YToken_1.YTokenType.POW_ASSIGN:
            return YToken_1.YTokenType.POWER;
        case YToken_1.YTokenType.PLUS_ASSIGN:
            return YToken_1.YTokenType.PLUS;
        case YToken_1.YTokenType.MINUS_ASSIGN:
            return YToken_1.YTokenType.MINUS;
    }
}
function isPostfixOperator(type) {
    switch (type) {
        case YToken_1.YTokenType.INCREMENT:
        case YToken_1.YTokenType.DECREMENT:
            return true;
        default:
            return false;
    }
}
function isExpressionTerminator(type) {
    switch (type) {
        case YToken_1.YTokenType.STATEMENT_END:
        case YToken_1.YTokenType.MODULO:
        case YToken_1.YTokenType.MULTIPLY:
        case YToken_1.YTokenType.DIVIDE:
        case YToken_1.YTokenType.PLUS:
        case YToken_1.YTokenType.MINUS:
        case YToken_1.YTokenType.POWER:
        case YToken_1.YTokenType.RBRACE:
        case YToken_1.YTokenType.RPAREN:
        case YToken_1.YTokenType.RBRACKET:
            return true;
        default:
            return false;
    }
}
