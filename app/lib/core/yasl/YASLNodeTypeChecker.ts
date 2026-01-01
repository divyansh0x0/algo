import {
    type IdentifierNode,
    type IndexingOperation,
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
        switch (node.type) {
            case YASLNodeType.IndexingOperation:
            case YASLNodeType.IDENTIFIER:
            case YASLNodeType.PROPERTY_ACCESS:
                return true;
            default:
                return false;
        }
    }

    static isExpression(node: YASLNode): node is YASLExpression {
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

    }

    static isIndexingOperator(node: YASLNode): node is IndexingOperation {
        return node.type === YASLNodeType.IndexingOperation;
    }
}