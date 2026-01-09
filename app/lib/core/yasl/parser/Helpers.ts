import type { YASLValueType } from "../tree";
import { type YASLToken, YASLTokenType } from "../YASLToken";
import { binarySearch } from "./BinarySearch";

export function parseTypeToken(token: YASLToken): YASLValueType | null {
    switch (token.lexeme) {
        case "string":
        case "int":
        case "Set":
        case "Queue":
        case "Function":
            return token.lexeme as YASLValueType;
        default:
            return null;
    }
}

export function isOperator(token: YASLToken) {
    if (!token)
        return false;
    switch (token.type) {
        case YASLTokenType.LPAREN:
        case YASLTokenType.LBRACKET:
        case YASLTokenType.DOT:
        case YASLTokenType.MODULO:
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.DIVIDE:
        case YASLTokenType.PLUS:
        case YASLTokenType.MINUS:
        case YASLTokenType.POWER:
        case YASLTokenType.INLINE_ASSIGN:
        case YASLTokenType.DECREMENT:
        case YASLTokenType.INCREMENT:
            return true;
        default:
            return false;
    }
}

export function getBindingPower(token_type: YASLTokenType): [ number, number ] | null {
    //right associative has lower right power while left associative has lower left power
    switch (token_type) {
        case YASLTokenType.DOT:
            return [ 100, 101 ];

        case YASLTokenType.LPAREN:
        case YASLTokenType.LBRACKET:
            return [ 90, 91 ];
        case YASLTokenType.AND:
        case YASLTokenType.OR:
            return [ 80, 81 ];
        case YASLTokenType.INCREMENT:
        case YASLTokenType.DECREMENT:
            return [ 80, -1 ];
        case YASLTokenType.POWER:
            return [ 30, 29 ];
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.MODULO:
        case YASLTokenType.DIVIDE:
            return [ 20, 21 ];
        case YASLTokenType.MINUS:
        case YASLTokenType.PLUS:
            return [ 10, 11 ];
        case YASLTokenType.INLINE_ASSIGN:
            return [ 1, 0 ];

        default:
            return null;
    }
}

export function isAssignmentOperator(type: YASLTokenType): boolean {
    switch (type) {
        case YASLTokenType.ASSIGN:
        case YASLTokenType.MULTIPLY_ASSIGN:
        case YASLTokenType.DIVIDE_ASSIGN:
        case YASLTokenType.MOD_ASSIGN:
        case YASLTokenType.POW_ASSIGN:
        case YASLTokenType.PLUS_ASSIGN:
        case YASLTokenType.MINUS_ASSIGN:
            return true;
        default:
            return false;
    }
}

export function isPostfixOperator(type: YASLTokenType): boolean {
    switch (type) {
        case YASLTokenType.INCREMENT:
        case YASLTokenType.DECREMENT:
            return true;
        default:
            return false;

    }
}

export function isExpressionTerminator(type: YASLTokenType): boolean {
    switch (type) {
        case YASLTokenType.STATEMENT_END:
        case YASLTokenType.MODULO:
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.DIVIDE:
        case YASLTokenType.PLUS:
        case YASLTokenType.MINUS:
        case YASLTokenType.POWER:
            return true;
        default:
            return false;

    }
}
