import {
    type IdentifierNode,
    type PropertyAccessNode,
    type YASLExpression,
    type YASLLValue,
    type YASLNode,
    YASLNodeType
} from "./tree";

export class YASLNodeTypeChecker {
    static isIdentifier(node: YASLNode): node is IdentifierNode {
        return node.type === YASLNodeType.IDENTIFIER;
    }

    static isPropertyAccess(node: YASLNode): node is PropertyAccessNode {
        return node.type === YASLNodeType.PROPERTY_ACCESS;
    }

    static isLValue(node: YASLNode): node is YASLLValue {
        return node.type === YASLNodeType.PROPERTY_ACCESS || node.type === YASLNodeType.IDENTIFIER;
    }

    static isExpression(node: YASLNode): node is YASLExpression {
        switch (node.type) {
            case YASLNodeType.BINARY_EXPRESSION:
            case YASLNodeType.ASSIGNMENT:
            case YASLNodeType.TERNARY_EXPRESSION:
            case YASLNodeType.UNARY_EXPRESSION:
            case YASLNodeType.LITERAL:
                return true;
            default:
                return false;
        }

    }
}