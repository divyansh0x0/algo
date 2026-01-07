import { type YASLExpression, type YASLLValue, YASLNodeType } from "./YASLAst";
import type { ExpIdentifierNode,ExpCallNode, ExpPropertyAccessNode, OpIndexingNode, YASLNode } from "./YASLNode";


export const YASLNodeTypeChecker = {
    isIdentifier(node?: YASLNode | null): node is ExpIdentifierNode {
        return node !== null && node !== undefined && node.type === YASLNodeType.IDENTIFIER;
    },

    isPropertyAccess(node: YASLNode): node is ExpPropertyAccessNode {
        return node.type === YASLNodeType.EXP_PROPERTY_ACCESS;
    },

    isLValue(node: YASLNode): node is YASLLValue {
        switch (node.type) {
            case YASLNodeType.OP_INDEXING:
            case YASLNodeType.EXP_IDENTIFIER:
            case YASLNodeType.EXP_PROPERTY_ACCESS:
                return true;
            default:
                return false;
        }
    },

    isExpression(node: YASLNode): node is YASLExpression {
        switch (node.type) {
            case YASLNodeType.EXP_BINARY:
            case YASLNodeType.EXP_ASSIGN:
            case YASLNodeType.EXP_UNARY:
            case YASLNodeType.EXP_LITERAL:
            case YASLNodeType.EXP_PROPERTY_ACCESS:
            case YASLNodeType.EXP_IDENTIFIER:
            case YASLNodeType.OP_INDEXING:
            case YASLNodeType.OP_TERNARY:
                return true;
            default:
                return false;
        }

    },

    isIndexingOperator(node: YASLNode): node is OpIndexingNode {
        return node.type === YASLNodeType.OP_INDEXING;
    },
    isFunctionCall(node: YASLNode | undefined): node is ExpCallNode  {
        return node !== undefined && node.type === YASLNodeType.EXP_CALL;
    }
};