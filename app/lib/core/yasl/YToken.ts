export enum YTokenType {
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

export function StringifyTokenType(token_type: YTokenType): string {
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

export type YTokenUnaryOp = YTokenType.NEGATE | YTokenType.MINUS | YTokenType.BIT_NOT;
export type YTokenPostfixOp = YTokenType.INCREMENT | YTokenType.DECREMENT;
export type YTokenBinaryOp =
    YTokenType.PLUS
    | YTokenType.MINUS
    | YTokenType.MULTIPLY
    | YTokenType.DIVIDE
    | YTokenType.MODULO
    | YTokenType.INLINE_ASSIGN
    | YTokenType.BIT_AND
    | YTokenType.BIT_OR
    | YTokenType.BIT_XOR
    | YTokenType.BIT_SHIFT_LEFT
    | YTokenType.BIT_SHIFT_RIGHT
    | YTokenType.AND
    | YTokenType.OR;
export const YKeywords = Object.freeze(new Map<string, YTokenType>(
    [
        [ "let", YTokenType.LET ],
        [ "switch", YTokenType.SWITCH ],
        [ "if", YTokenType.IF ],
        [ "else", YTokenType.ELSE ],
        [ "case", YTokenType.CASE ],
        [ "default", YTokenType.DEFAULT ],
        [ "for", YTokenType.FOR ],
        [ "while", YTokenType.WHILE ],
        [ "do", YTokenType.DO ],
        [ "break", YTokenType.BREAK ],
        [ "continue", YTokenType.CONTINUE ],
        [ "in", YTokenType.IN ],
        [ "instanceof", YTokenType.INSTANCEOF ],
        [ "fn", YTokenType.FUNCTION ],
        [ "return", YTokenType.RETURN ],
        [ "true", YTokenType.TRUE ],
        [ "false", YTokenType.FALSE ],
        [ "in", YTokenType.IN ],
        [ "and", YTokenType.AND ],
        [ "or", YTokenType.OR ],
        [ "not", YTokenType.NOT ],
        [ "null", YTokenType.NULL ],
        [ "then", YTokenType.THEN ]
    ]
));

export interface YToken {
    type: YTokenType;
    lexeme: string;
    literal: object | string | number | boolean | null;
    // line: number;
    start: number;
    end: number;
}


