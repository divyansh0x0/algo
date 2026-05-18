import { YValueType } from "../YAst";
import { type YToken, type YTokenBinaryOp, YTokenType } from "../YToken";

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
        case YTokenType.LESS_THAN:
        case YTokenType.LESS_THAN_EQUAL_TO:
        case YTokenType.GREATER_THAN:
        case YTokenType.GREATER_THAN_EQUAL_TO:
        case YTokenType.EQUAL_EQUAL:
        case YTokenType.NOT_EQUAL:
        case YTokenType.BIT_AND:
        case YTokenType.BIT_OR:
        case YTokenType.BIT_NOT:
        case YTokenType.BIT_SHIFT_LEFT:
        case YTokenType.BIT_SHIFT_RIGHT:
        case YTokenType.BIT_XOR:
        case YTokenType.NOT:
        case YTokenType.OR:
        case YTokenType.AND:
        case YTokenType.NEGATE:
            return true;
        default:
            return false;
    }
}

export function getBindingPower(token_type: YTokenType): [number, number] | null {
    //right associative has lower right power while left associative has lower left power
    switch (token_type) {
        case YTokenType.DOT:
            return [120, 121];

        case YTokenType.LPAREN:
        case YTokenType.LBRACKET:
            return [110, 111];

        case YTokenType.INCREMENT:
        case YTokenType.DECREMENT:
            return [100, -1];

        case YTokenType.POWER:
            return [90, 89];

        case YTokenType.MULTIPLY:
        case YTokenType.MODULO:
        case YTokenType.DIVIDE:
            return [80, 81];

        case YTokenType.BIT_AND:
        case YTokenType.BIT_OR:
        case YTokenType.BIT_XOR:
        case YTokenType.BIT_NOT:
            return [70, 71];

        case YTokenType.BIT_SHIFT_LEFT:
        case YTokenType.BIT_SHIFT_RIGHT:
            return [60, 61];

        case YTokenType.PLUS:
        case YTokenType.MINUS:
            return [50, 51];

        case YTokenType.LESS_THAN:
        case YTokenType.LESS_THAN_EQUAL_TO:
        case YTokenType.GREATER_THAN:
        case YTokenType.GREATER_THAN_EQUAL_TO:
            return [40, 41];

        case YTokenType.EQUAL_EQUAL:
        case YTokenType.NOT_EQUAL:
            return [30, 31];

        case YTokenType.AND:
            return [20, 21];

        case YTokenType.OR:
            return [10, 11];

        case YTokenType.INLINE_ASSIGN:
            return [1, 0];

        default:
            return null;
    }
}

export type YTokenAugmentedAssignOp =
    | YTokenType.MULTIPLY_ASSIGN
    | YTokenType.DIVIDE_ASSIGN
    | YTokenType.MOD_ASSIGN
    | YTokenType.POW_ASSIGN
    | YTokenType.PLUS_ASSIGN
    | YTokenType.MINUS_ASSIGN;

export type YTokenAssignmentOp = YTokenType.ASSIGN | YTokenAugmentedAssignOp;

export function isAssignmentOperator(type: YTokenType): type is YTokenAssignmentOp {
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

export function getAugmentedAssignmentOperatorToken(type: YTokenAugmentedAssignOp): YTokenBinaryOp {
    switch (type) {
        case YTokenType.MULTIPLY_ASSIGN:
            return YTokenType.MULTIPLY;
        case YTokenType.DIVIDE_ASSIGN:
            return YTokenType.DIVIDE;
        case YTokenType.MOD_ASSIGN:
            return YTokenType.MODULO;
        case YTokenType.POW_ASSIGN:
            return YTokenType.POWER;
        case YTokenType.PLUS_ASSIGN:
            return YTokenType.PLUS;
        case YTokenType.MINUS_ASSIGN:
            return YTokenType.MINUS;
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
        case YTokenType.RBRACE:
        case YTokenType.RPAREN:
        case YTokenType.RBRACKET:
            return true;
        default:
            return false;

    }
}
