"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YKeywords = exports.YTokenType = void 0;
exports.StringifyTokenType = StringifyTokenType;
var YTokenType;
(function (YTokenType) {
    // Comparison
    YTokenType["ERROR"] = "error";
    YTokenType["COMMENT"] = "comment";
    YTokenType["WHITESPACE"] = "whitespace";
    YTokenType["STATEMENT_END"] = ";";
    YTokenType["EQUAL_EQUAL"] = "==";
    YTokenType["NOT_EQUAL"] = "!=";
    YTokenType["LESS_THAN"] = "<";
    YTokenType["GREATER_THAN"] = ">";
    YTokenType["LESS_THAN_EQUAL_TO"] = "<=";
    YTokenType["GREATER_THAN_EQUAL_TO"] = ">=";
    // Assignment
    YTokenType["ASSIGN"] = "=";
    YTokenType["INLINE_ASSIGN"] = ":=";
    YTokenType["PLUS_ASSIGN"] = "+=";
    YTokenType["MINUS_ASSIGN"] = "-=";
    YTokenType["MULTIPLY_ASSIGN"] = "*=";
    YTokenType["DIVIDE_ASSIGN"] = "/=";
    YTokenType["MOD_ASSIGN"] = "%=";
    YTokenType["POW_ASSIGN"] = "**=";
    // Arithmetic
    YTokenType["PLUS"] = "+";
    YTokenType["MINUS"] = "-";
    YTokenType["MULTIPLY"] = "*";
    YTokenType["DIVIDE"] = "/";
    YTokenType["MODULO"] = "%";
    YTokenType["POWER"] = "**";
    // Logical
    YTokenType["AND"] = "and";
    YTokenType["OR"] = "or";
    YTokenType["NOT"] = "not";
    // BITWISE
    YTokenType["BIT_AND"] = "&";
    YTokenType["BIT_OR"] = "|";
    YTokenType["BIT_NOT"] = "~";
    YTokenType["BIT_XOR"] = "^";
    YTokenType["BIT_SHIFT_LEFT"] = "<<";
    YTokenType["BIT_SHIFT_RIGHT"] = ">>";
    // Unary
    YTokenType["INCREMENT"] = "++";
    YTokenType["DECREMENT"] = "--";
    YTokenType["NEGATE"] = "!";
    // Literals
    YTokenType["NUMBER"] = "number";
    YTokenType["STRING"] = "string";
    YTokenType["NULL"] = "null";
    // Keywords
    YTokenType["LET"] = "let";
    YTokenType["IF"] = "if";
    YTokenType["ELSE"] = "else";
    YTokenType["SWITCH"] = "switch";
    YTokenType["CASE"] = "case";
    YTokenType["DEFAULT"] = "default";
    YTokenType["FOR"] = "for";
    YTokenType["WHILE"] = "while";
    YTokenType["THEN"] = "then";
    YTokenType["DO"] = "do";
    YTokenType["BREAK"] = "break";
    YTokenType["CONTINUE"] = "continue";
    YTokenType["IN"] = "in";
    YTokenType["INSTANCEOF"] = "instanceof";
    YTokenType["FUNCTION"] = "fn";
    YTokenType["RETURN"] = "return";
    YTokenType["TRUE"] = "true";
    YTokenType["FALSE"] = "false";
    // Symbols
    YTokenType["LPAREN"] = "(";
    YTokenType["RPAREN"] = ")";
    YTokenType["LBRACKET"] = "[";
    YTokenType["RBRACKET"] = "]";
    YTokenType["LBRACE"] = "{";
    YTokenType["RBRACE"] = "}";
    YTokenType["COMMA"] = ",";
    YTokenType["DOT"] = ".";
    YTokenType["COLON"] = ":";
    YTokenType["IDENTIFIER"] = "identifier";
})(YTokenType || (exports.YTokenType = YTokenType = {}));
function StringifyTokenType(token_type) {
    switch (token_type) {
        // Operators (arithmetic, logical, bitwise, assignment, comparison, unary)
        case YTokenType.PLUS:
        case YTokenType.MINUS:
        case YTokenType.MULTIPLY:
        case YTokenType.DIVIDE:
        case YTokenType.MODULO:
        case YTokenType.POWER:
        case YTokenType.PLUS_ASSIGN:
        case YTokenType.MINUS_ASSIGN:
        case YTokenType.MULTIPLY_ASSIGN:
        case YTokenType.DIVIDE_ASSIGN:
        case YTokenType.MOD_ASSIGN:
        case YTokenType.POW_ASSIGN:
        case YTokenType.EQUAL_EQUAL:
        case YTokenType.NOT_EQUAL:
        case YTokenType.LESS_THAN:
        case YTokenType.GREATER_THAN:
        case YTokenType.LESS_THAN_EQUAL_TO:
        case YTokenType.GREATER_THAN_EQUAL_TO:
        case YTokenType.AND:
        case YTokenType.OR:
        case YTokenType.NOT:
        case YTokenType.BIT_AND:
        case YTokenType.BIT_OR:
        case YTokenType.BIT_NOT:
        case YTokenType.BIT_XOR:
        case YTokenType.BIT_SHIFT_LEFT:
        case YTokenType.BIT_SHIFT_RIGHT:
        case YTokenType.INCREMENT:
        case YTokenType.DECREMENT:
        case YTokenType.NEGATE:
        case YTokenType.ASSIGN:
        case YTokenType.INLINE_ASSIGN:
            return "operator";
        // Literals
        case YTokenType.NUMBER:
            return "number";
        case YTokenType.STRING:
            return "string";
        case YTokenType.WHITESPACE:
            return "whitespace";
        case YTokenType.COMMENT:
            return "comment";
        // Keywords
        case YTokenType.NULL:
        case YTokenType.TRUE:
        case YTokenType.FALSE:
        case YTokenType.LET:
        case YTokenType.IF:
        case YTokenType.ELSE:
        case YTokenType.SWITCH:
        case YTokenType.CASE:
        case YTokenType.DEFAULT:
        case YTokenType.FOR:
        case YTokenType.WHILE:
        case YTokenType.THEN:
        case YTokenType.DO:
        case YTokenType.BREAK:
        case YTokenType.CONTINUE:
        case YTokenType.IN:
        case YTokenType.INSTANCEOF:
        case YTokenType.FUNCTION:
        case YTokenType.RETURN:
            return "keyword";
        // Symbols
        case YTokenType.LPAREN:
        case YTokenType.RPAREN:
        case YTokenType.LBRACKET:
        case YTokenType.RBRACKET:
        case YTokenType.LBRACE:
        case YTokenType.RBRACE:
        case YTokenType.COMMA:
        case YTokenType.DOT:
        case YTokenType.COLON:
        case YTokenType.STATEMENT_END:
            return "symbol";
        // Identifier
        case YTokenType.IDENTIFIER:
            return "identifier";
        // Unknown tokens
        case YTokenType.ERROR:
            return "error";
        default:
            throw "Not implemented token type stringification" + token_type;
    }
}
exports.YKeywords = Object.freeze(new Map([
    ["let", YTokenType.LET],
    ["switch", YTokenType.SWITCH],
    ["if", YTokenType.IF],
    ["else", YTokenType.ELSE],
    ["case", YTokenType.CASE],
    ["default", YTokenType.DEFAULT],
    ["for", YTokenType.FOR],
    ["while", YTokenType.WHILE],
    ["do", YTokenType.DO],
    ["break", YTokenType.BREAK],
    ["continue", YTokenType.CONTINUE],
    ["in", YTokenType.IN],
    ["instanceof", YTokenType.INSTANCEOF],
    ["fn", YTokenType.FUNCTION],
    ["return", YTokenType.RETURN],
    ["true", YTokenType.TRUE],
    ["false", YTokenType.FALSE],
    ["in", YTokenType.IN],
    ["and", YTokenType.AND],
    ["or", YTokenType.OR],
    ["not", YTokenType.NOT],
    ["null", YTokenType.NULL],
    ["then", YTokenType.THEN]
]));
