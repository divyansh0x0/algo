export enum YASLTokenType {
    // Comparison
    ERROR = "error",
    COMMENT = "comment",
    WHITESPACE = "whitespace",
    STATEMENT_END = ";",
    EQUAL_EQUAL = "==",
    NOT_EQUAL = "!=",
    LESS_THAN = "<",
    GREATER_THAN = ">",
    LESS_THAN_EQUAL_TO = "<=",
    GREATER_THAN_EQUAL_TO = ">=",

    // Assignment
    ASSIGN = "=",
    INLINE_ASSIGN = ":=",
    PLUS_ASSIGN = "+=",
    MINUS_ASSIGN = "-=",
    MULTIPLY_ASSIGN = "*=",
    DIVIDE_ASSIGN = "/=",
    MOD_ASSIGN = "%=",
    POW_ASSIGN = "**=",

    // Arithmetic
    PLUS = "+",
    MINUS = "-",
    MULTIPLY = "*",
    DIVIDE = "/",
    MODULO = "%",
    POWER = "**",

    // Logical
    AND = "and",
    OR = "or",
    NOT = "not",
    // BITWISE
    BIT_AND = "&",
    BIT_OR = "|",
    BIT_NOT = "~",
    BIT_XOR = "^",
    BIT_SHIFT_LEFT = "<<",
    BIT_SHIFT_RIGHT = ">>",
    // Unary
    INCREMENT = "++",
    DECREMENT = "--",
    NEGATE = "!",

    // Literals
    NUMBER = "number",
    STRING = "string",
    NULL = "null",

    // Keywords
    LET = "let",
    IF = "if",
    ELSE = "else",
    SWITCH = "switch",
    CASE = "case",
    DEFAULT = "default",
    FOR = "for",
    WHILE = "while",
    THEN = "then",
    DO = "do",
    BREAK = "break",
    CONTINUE = "continue",
    IN = "in",
    INSTANCEOF = "instanceof",
    FUNCTION = "fn",
    RETURN = "return",
    TRUE = "true",
    FALSE = "false",

    // Symbols
    LPAREN = "(",
    RPAREN = ")",
    LBRACKET = "[",
    RBRACKET = "]",
    LBRACE = "{",
    RBRACE = "}",
    COMMA = ",",
    DOT = ".",
    COLON = ":",

    IDENTIFIER = "identifier",
}

export function StringifyTokenType(token_type: YASLTokenType): string {
    switch (token_type) {
        // Operators (arithmetic, logical, bitwise, assignment, comparison, unary)
        case YASLTokenType.PLUS:
        case YASLTokenType.MINUS:
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.DIVIDE:
        case YASLTokenType.MODULO:
        case YASLTokenType.POWER:
        case YASLTokenType.PLUS_ASSIGN:
        case YASLTokenType.MINUS_ASSIGN:
        case YASLTokenType.MULTIPLY_ASSIGN:
        case YASLTokenType.DIVIDE_ASSIGN:
        case YASLTokenType.MOD_ASSIGN:
        case YASLTokenType.POW_ASSIGN:
        case YASLTokenType.EQUAL_EQUAL:
        case YASLTokenType.NOT_EQUAL:
        case YASLTokenType.LESS_THAN:
        case YASLTokenType.GREATER_THAN:
        case YASLTokenType.LESS_THAN_EQUAL_TO:
        case YASLTokenType.GREATER_THAN_EQUAL_TO:
        case YASLTokenType.AND:
        case YASLTokenType.OR:
        case YASLTokenType.NOT:
        case YASLTokenType.BIT_AND:
        case YASLTokenType.BIT_OR:
        case YASLTokenType.BIT_NOT:
        case YASLTokenType.BIT_XOR:
        case YASLTokenType.BIT_SHIFT_LEFT:
        case YASLTokenType.BIT_SHIFT_RIGHT:
        case YASLTokenType.INCREMENT:
        case YASLTokenType.DECREMENT:
        case YASLTokenType.NEGATE:
        case YASLTokenType.ASSIGN:
        case YASLTokenType.INLINE_ASSIGN:
            return "operator";

        // Literals
        case YASLTokenType.NUMBER:
            return "number";
        case YASLTokenType.STRING:
            return "string";

        case YASLTokenType.WHITESPACE:
            return "whitespace";
        case YASLTokenType.COMMENT:
            return "comment";
        // Keywords
        case YASLTokenType.NULL:
        case YASLTokenType.TRUE:
        case YASLTokenType.FALSE:
        case YASLTokenType.LET:
        case YASLTokenType.IF:
        case YASLTokenType.ELSE:
        case YASLTokenType.SWITCH:
        case YASLTokenType.CASE:
        case YASLTokenType.DEFAULT:
        case YASLTokenType.FOR:
        case YASLTokenType.WHILE:
        case YASLTokenType.THEN:
        case YASLTokenType.DO:
        case YASLTokenType.BREAK:
        case YASLTokenType.CONTINUE:
        case YASLTokenType.IN:
        case YASLTokenType.INSTANCEOF:
        case YASLTokenType.FUNCTION:
        case YASLTokenType.RETURN:
            return "keyword";

        // Symbols
        case YASLTokenType.LPAREN:
        case YASLTokenType.RPAREN:
        case YASLTokenType.LBRACKET:
        case YASLTokenType.RBRACKET:
        case YASLTokenType.LBRACE:
        case YASLTokenType.RBRACE:
        case YASLTokenType.COMMA:
        case YASLTokenType.DOT:
        case YASLTokenType.COLON:
        case YASLTokenType.STATEMENT_END:
            return "symbol";

        // Identifier
        case YASLTokenType.IDENTIFIER:
            return "identifier";

        // Unknown tokens
        case YASLTokenType.ERROR:
            return "error";

        default:
            throw "Not implemented token type stringification" + token_type;
    }
}

export type YASLTokenUnaryOp = YASLTokenType.NEGATE | YASLTokenType.MINUS | YASLTokenType.BIT_NOT;
export type YASLTokenPostfixOp = YASLTokenType.INCREMENT | YASLTokenType.DECREMENT;
export type YASLTokenBinaryOp =
    YASLTokenType.PLUS
    | YASLTokenType.MINUS
    | YASLTokenType.MULTIPLY
    | YASLTokenType.DIVIDE
    | YASLTokenType.MODULO
    | YASLTokenType.INLINE_ASSIGN
    | YASLTokenType.BIT_AND
    | YASLTokenType.BIT_OR
    | YASLTokenType.BIT_XOR
    | YASLTokenType.BIT_SHIFT_LEFT
    | YASLTokenType.BIT_SHIFT_RIGHT
    | YASLTokenType.AND
    | YASLTokenType.OR;
export const keywords = Object.freeze(new Map<string, YASLTokenType>(
    [
        ["let", YASLTokenType.LET],
        ["switch", YASLTokenType.SWITCH],
        ["if", YASLTokenType.IF],
        ["else", YASLTokenType.ELSE],
        ["case", YASLTokenType.CASE],
        ["default", YASLTokenType.DEFAULT],
        ["for", YASLTokenType.FOR],
        ["while", YASLTokenType.WHILE],
        ["do", YASLTokenType.DO],
        ["break", YASLTokenType.BREAK],
        ["continue", YASLTokenType.CONTINUE],
        ["in", YASLTokenType.IN],
        ["instanceof", YASLTokenType.INSTANCEOF],
        ["fn", YASLTokenType.FUNCTION],
        ["return", YASLTokenType.RETURN],
        ["true", YASLTokenType.TRUE],
        ["false", YASLTokenType.FALSE],
        ["in", YASLTokenType.IN],
        ["and", YASLTokenType.AND],
        ["or", YASLTokenType.OR],
        ["not", YASLTokenType.NOT],
        ["null", YASLTokenType.NULL],
        ["then", YASLTokenType.THEN]
    ]
));

export interface YASLToken {
    type: YASLTokenType;
    lexeme: string;
    literal: Object | string | number | boolean | null;
    // line: number;
    start: number;
    end: number;
}


