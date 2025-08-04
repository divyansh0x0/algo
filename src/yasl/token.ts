export enum TokenType {
    // Comparison
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
    EOF = "\0",
}

export function StringifyTokenType(token_type: TokenType): string {
    switch (token_type) {
        // Operators (arithmetic, logical, bitwise, assignment, comparison, unary)
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.MULTIPLY:
        case TokenType.DIVIDE:
        case TokenType.MODULO:
        case TokenType.POWER:
        case TokenType.PLUS_ASSIGN:
        case TokenType.MINUS_ASSIGN:
        case TokenType.MULTIPLY_ASSIGN:
        case TokenType.DIVIDE_ASSIGN:
        case TokenType.MOD_ASSIGN:
        case TokenType.POW_ASSIGN:
        case TokenType.EQUAL_EQUAL:
        case TokenType.NOT_EQUAL:
        case TokenType.LESS_THAN:
        case TokenType.GREATER_THAN:
        case TokenType.LESS_THAN_EQUAL_TO:
        case TokenType.GREATER_THAN_EQUAL_TO:
        case TokenType.AND:
        case TokenType.OR:
        case TokenType.NOT:
        case TokenType.BIT_AND:
        case TokenType.BIT_OR:
        case TokenType.BIT_NOT:
        case TokenType.BIT_XOR:
        case TokenType.BIT_SHIFT_LEFT:
        case TokenType.BIT_SHIFT_RIGHT:
        case TokenType.INCREMENT:
        case TokenType.DECREMENT:
        case TokenType.NEGATE:
        case TokenType.ASSIGN:
        case TokenType.INLINE_ASSIGN:
            return "operator";

        // Literals
        case TokenType.NUMBER:
            return "number";
        case TokenType.STRING:
            return "string";


        // Keywords
        case TokenType.NULL:
        case TokenType.TRUE:
        case TokenType.FALSE:
        case TokenType.LET:
        case TokenType.IF:
        case TokenType.ELSE:
        case TokenType.SWITCH:
        case TokenType.CASE:
        case TokenType.DEFAULT:
        case TokenType.FOR:
        case TokenType.WHILE:
        case TokenType.THEN:
        case TokenType.DO:
        case TokenType.BREAK:
        case TokenType.CONTINUE:
        case TokenType.IN:
        case TokenType.INSTANCEOF:
        case TokenType.FUNCTION:
        case TokenType.RETURN:
            return "keyword";

        // Symbols
        case TokenType.LPAREN:
        case TokenType.RPAREN:
        case TokenType.LBRACKET:
        case TokenType.RBRACKET:
        case TokenType.LBRACE:
        case TokenType.RBRACE:
        case TokenType.COMMA:
        case TokenType.DOT:
        case TokenType.COLON:
        case TokenType.STATEMENT_END:
            return "symbol";

        // Identifier
        case TokenType.IDENTIFIER:
            return "identifier";

        // End of file
        case TokenType.EOF:
            return "eof";

        default:
            return "unknown";
    }
}

export type UnaryOperatorToken = TokenType.NEGATE | TokenType.MINUS | TokenType.BIT_NOT;
export type PostfixOperatorToken = TokenType.INCREMENT | TokenType.DECREMENT;
export type BinaryOperatorToken =
    TokenType.PLUS
    | TokenType.MINUS
    | TokenType.MULTIPLY
    | TokenType.DIVIDE
    | TokenType.MODULO
    | TokenType.INLINE_ASSIGN
    | TokenType.BIT_AND
    | TokenType.BIT_OR
    | TokenType.BIT_XOR
    | TokenType.BIT_SHIFT_LEFT
    | TokenType.BIT_SHIFT_RIGHT
    | TokenType.AND
    | TokenType.OR;
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
        [ "null", TokenType.NULL ],
        [ "then", TokenType.THEN ]
    ]
));

export interface Token {
    type: TokenType;
    lexeme: string;
    literal: Object | string | number | boolean | null;
    line: number;
    start: number;
    end: number;
}


