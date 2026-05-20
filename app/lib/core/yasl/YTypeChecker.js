"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YTypeChecker = void 0;
var YAst_1 = require("./YAst");
exports.YTypeChecker = {
    isIdentifier: function (node) {
        return node !== null && node !== undefined && node.type === YAst_1.YNodeType.EXP_IDENTIFIER;
    },
    isPropertyAccess: function (node) {
        return node.type === YAst_1.YNodeType.EXP_PROPERTY_ACCESS;
    },
    isLValue: function (node) {
        switch (node.type) {
            case YAst_1.YNodeType.OP_INDEXING:
            case YAst_1.YNodeType.EXP_IDENTIFIER:
            case YAst_1.YNodeType.EXP_PROPERTY_ACCESS:
                return true;
            default:
                return false;
        }
    },
    isExpression: function (node) {
        switch (node.type) {
            case YAst_1.YNodeType.EXP_BINARY:
            case YAst_1.YNodeType.EXP_ASSIGN:
            case YAst_1.YNodeType.EXP_UNARY:
            case YAst_1.YNodeType.EXP_LITERAL:
            case YAst_1.YNodeType.EXP_PROPERTY_ACCESS:
            case YAst_1.YNodeType.EXP_IDENTIFIER:
            case YAst_1.YNodeType.OP_INDEXING:
            case YAst_1.YNodeType.OP_TERNARY:
                return true;
            default:
                return false;
        }
    },
    isIndexingOperator: function (node) {
        return node.type === YAst_1.YNodeType.OP_INDEXING;
    },
    isFunctionCall: function (node) {
        return node !== undefined && node.type === YAst_1.YNodeType.EXP_CALL;
    }
};
