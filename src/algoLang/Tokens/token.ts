export enum TokenType {
    // Comparison
    EQUAL_TO = "==",
    NOT_EQUAL_TO = "!=",
    LESS_THAN = "<",
    GREATER_THAN = ">",
    LESS_THAN_EQUAL_TO = "<=",
    GREATER_THAN_EQUAL_TO = ">=",

    // Assignment
    ASSIGN = "=",
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
    BOOLEAN = "boolean",
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
    COLON = ":",
    SEMICOLON = ";",

    COMMENT = "//",
    IDENTIFIER = "identifier",
    EOF = "\0"
}

export const keywords = Object.freeze(new Map<string, TokenType>(
    [
        [ "let", TokenType.LET ],
        [ "switch", TokenType.SWITCH ],
        [ "if", TokenType.IF ],
        [ "else", TokenType.ELSE ],
        [ "case", TokenType.CASE ],
        [ "default", TokenType.DEFAULT ],
        [ "for", TokenType.FOR ],
        [ "while", TokenType.WHILE ],
        [ "do", TokenType.DO ],
        [ "break", TokenType.BREAK ],
        [ "continue", TokenType.CONTINUE ],
        [ "in", TokenType.IN ],
        [ "instanceof", TokenType.INSTANCEOF ],
        [ "fn", TokenType.FUNCTION ],
        [ "return", TokenType.RETURN ],
        [ "true", TokenType.TRUE ],
        [ "false", TokenType.FALSE ],
        [ "in", TokenType.IN ],
        [ "and", TokenType.AND ],
        [ "or", TokenType.OR ],
        [ "not", TokenType.NOT ],
        [ "null", TokenType.NULL ]
    ]
));

export interface Token {
    token_type: TokenType;
    lexeme: string;
    literal: Object | null;
    line: number;
    col: number;

}
