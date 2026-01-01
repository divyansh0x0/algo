import {
    type IdentifierNode,
    type IndexingOperation,
    type PropertyAccessNode,
    type YASLExpression,
    type YASLLValue,
    type YASLNode,
    YASLNodeType
} from "./tree";

export const YASLNodeTypeChecker = {
    isIdentifier(node?: YASLNode|null): node is IdentifierNode {
        return node !== null && node !== undefined && node.type === YASLNodeType.IDENTIFIER;
    },

    isPropertyAccess(node: YASLNode): node is PropertyAccessNode {
        return node.type === YASLNodeType.PROPERTY_ACCESS;
    },

    isLValue(node: YASLNode): node is YASLLValue {
        switch (node.type) {
            case YASLNodeType.IndexingOperation:
            case YASLNodeType.IDENTIFIER:
            case YASLNodeType.PROPERTY_ACCESS:
                return true;
            default:
                return false;
        }
    },

    isExpression(node: YASLNode): node is YASLExpression {
        switch (node.type) {
            case YASLNodeType.BINARY_EXPRESSION:
            case YASLNodeType.ASSIGNMENT:
            case YASLNodeType.TERNARY_EXPRESSION:
            case YASLNodeType.UNARY_EXPRESSION:
            case YASLNodeType.LITERAL:
            case YASLNodeType.PROPERTY_ACCESS:
            case YASLNodeType.IndexingOperation:
            case YASLNodeType.IDENTIFIER:
                return true;
            default:
                return false;
        }

    },

    isIndexingOperator(node: YASLNode): node is IndexingOperation {
        return node.type === YASLNodeType.IndexingOperation;
    },
}