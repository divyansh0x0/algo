import { type YExpression, type YLValue, YNodeType } from "./YAst";
import type { ExpIdentifierNode,ExpCallNode, ExpPropertyAccessNode, OpIndexingNode, YNode } from "./YNode";


export const YTypeChecker = {
    isIdentifier(node?: YNode | null): node is ExpIdentifierNode {
        return node !== null && node !== undefined && node.type === YNodeType.EXP_IDENTIFIER;
    },

    isPropertyAccess(node: YNode): node is ExpPropertyAccessNode {
        return node.type === YNodeType.EXP_PROPERTY_ACCESS;
    },

    isLValue(node: YNode): node is YLValue {
        switch (node.type) {
            case YNodeType.OP_INDEXING:
            case YNodeType.EXP_IDENTIFIER:
            case YNodeType.EXP_PROPERTY_ACCESS:
                return true;
            default:
                return false;
        }
    },

    isExpression(node: YNode): node is YExpression {
        switch (node.type) {
            case YNodeType.EXP_BINARY:
            case YNodeType.EXP_ASSIGN:
            case YNodeType.EXP_UNARY:
            case YNodeType.EXP_LITERAL:
            case YNodeType.EXP_PROPERTY_ACCESS:
            case YNodeType.EXP_IDENTIFIER:
            case YNodeType.OP_INDEXING:
            case YNodeType.OP_TERNARY:
                return true;
            default:
                return false;
        }

    },

    isIndexingOperator(node: YNode): node is OpIndexingNode {
        return node.type === YNodeType.OP_INDEXING;
    },
    isFunctionCall(node: YNode | undefined): node is ExpCallNode  {
        return node !== undefined && node.type === YNodeType.EXP_CALL;
    }
};