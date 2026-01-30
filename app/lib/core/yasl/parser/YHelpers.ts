import { YValueType } from "../YAst";
import { type YToken, YTokenType } from "../YToken";

export function parseTypeToken(token: YToken): YValueType | null {
    switch (token.lexeme) {
        case "string":
            return YValueType.string;
        case "int":
            return YValueType.number;
        case "Set":
            return YValueType.set;
        case "Queue":
            return YValueType.queue;
        case "Function":
            return YValueType.function_signature;
        default:
            return null;
    }
}

export function isOperator(token: YToken) {
    if (!token)
        return false;
    switch (token.type) {
        case YTokenType.LPAREN:
        case YTokenType.LBRACKET:
        case YTokenType.DOT:
        case YTokenType.MODULO:
        case YTokenType.MULTIPLY:
        case YTokenType.DIVIDE:
        case YTokenType.PLUS:
        case YTokenType.MINUS:
        case YTokenType.POWER:
        case YTokenType.INLINE_ASSIGN:
        case YTokenType.DECREMENT:
        case YTokenType.INCREMENT:
            return true;
        default:
            return false;
    }
}

export function getBindingPower(token_type: YTokenType): [ number, number ] | null {
    //right associative has lower right power while left associative has lower left power
    switch (token_type) {
        case YTokenType.DOT:
            return [ 100, 101 ];

        case YTokenType.LPAREN:
        case YTokenType.LBRACKET:
            return [ 90, 91 ];
        case YTokenType.AND:
        case YTokenType.OR:
            return [ 80, 81 ];
        case YTokenType.INCREMENT:
        case YTokenType.DECREMENT:
            return [ 80, -1 ];
        case YTokenType.POWER:
            return [ 30, 29 ];
        case YTokenType.MULTIPLY:
        case YTokenType.MODULO:
        case YTokenType.DIVIDE:
            return [ 20, 21 ];
        case YTokenType.MINUS:
        case YTokenType.PLUS:
            return [ 10, 11 ];
        case YTokenType.INLINE_ASSIGN:
            return [ 1, 0 ];

        default:
            return null;
    }
}

export function isAssignmentOperator(type: YTokenType): boolean {
    switch (type) {
        case YTokenType.ASSIGN:
        case YTokenType.MULTIPLY_ASSIGN:
        case YTokenType.DIVIDE_ASSIGN:
        case YTokenType.MOD_ASSIGN:
        case YTokenType.POW_ASSIGN:
        case YTokenType.PLUS_ASSIGN:
        case YTokenType.MINUS_ASSIGN:
            return true;
        default:
            return false;
    }
}

export function isPostfixOperator(type: YTokenType): boolean {
    switch (type) {
        case YTokenType.INCREMENT:
        case YTokenType.DECREMENT:
            return true;
        default:
            return false;

    }
}

export function isExpressionTerminator(type: YTokenType): boolean {
    switch (type) {
        case YTokenType.STATEMENT_END:
        case YTokenType.MODULO:
        case YTokenType.MULTIPLY:
        case YTokenType.DIVIDE:
        case YTokenType.PLUS:
        case YTokenType.MINUS:
        case YTokenType.POWER:
            return true;
        default:
            return false;

    }
}
