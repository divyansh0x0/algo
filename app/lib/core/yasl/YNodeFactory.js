"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YNodeFactory = void 0;
var YAst_1 = require("./YAst");
var YNodeFactory = /** @class */ (function () {
    function YNodeFactory() {
        this.node_index = 0;
    }
    YNodeFactory.prototype.getDebugId = function () {
        return ++this.node_index;
    };
    // ==========================================
    // VARIABLES & SCOPE (DECLARATIONS, IDENTIFIERS)
    // ==========================================
    YNodeFactory.prototype.getDeclarationStatement = function (identifier_name, value, types, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_DECLARATION,
            lvalue: identifier_name,
            rvalue: value,
            types: types,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getAssignmentStatement = function (lvalue, rvalue) {
        return {
            type: YAst_1.YNodeType.STMT_ASSIGN,
            lvalue: lvalue,
            rvalue: rvalue,
            debugId: this.getDebugId(),
            startIndex: lvalue.startIndex,
            endIndex: rvalue.endIndex,
        };
    };
    YNodeFactory.prototype.getAssignmentExpression = function (lvalue, rvalue) {
        return {
            type: YAst_1.YNodeType.EXP_ASSIGN,
            lvalue: lvalue,
            rvalue: rvalue,
            debugId: this.getDebugId(),
            startIndex: lvalue.startIndex,
            endIndex: rvalue.endIndex,
        };
    };
    YNodeFactory.prototype.getIdentifierNode = function (name) {
        var name_str = name.lexeme;
        return {
            type: YAst_1.YNodeType.EXP_IDENTIFIER,
            name: name_str,
            debugId: this.getDebugId(),
            startIndex: name.start,
            endIndex: name.end,
        };
    };
    // ==========================================
    // CONTROL FLOW (BLOCKS, CONDITIONS, LOOPS)
    // ==========================================
    YNodeFactory.prototype.getBlockExpression = function (statements, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.EXP_BLOCK,
            statements: statements,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getIfStatement = function (condition, body, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_IF,
            condition: condition,
            body: body,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getIfExpression = function (condition, truthyResult, falsyResult, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.EXP_IF,
            condition: condition,
            truthyResult: truthyResult,
            falsyResult: falsyResult,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getElseStatement = function (body, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_ELSE,
            body: body,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getThenStatement = function (body, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_THEN,
            body: body,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getWhileStatement = function (condition, body, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_WHILE,
            condition: condition,
            body: body,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getForStatement = function (init_statement, condition, increment_statement, body, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_FOR,
            init_statement: init_statement,
            condition: condition,
            increment_statement: increment_statement,
            body: body,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getSwitchStatement = function (condition, cases, default_stmt, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_SWITCH,
            condition: condition,
            cases: cases,
            default_stmt: default_stmt,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getSwitchCaseStatement = function (condition, body, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.STMT_CASE,
            condition: condition,
            body: body,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getBreakStatement = function (token) {
        return {
            type: YAst_1.YNodeType.STMT_BREAK,
            debugId: this.getDebugId(),
            startIndex: token.start,
            endIndex: token.end,
        };
    };
    YNodeFactory.prototype.getContinueStatement = function (token) {
        return {
            type: YAst_1.YNodeType.STMT_CONTINUE,
            debugId: this.getDebugId(),
            startIndex: token.start,
            endIndex: token.end,
        };
    };
    YNodeFactory.prototype.getReturnStatement = function (token) {
        return {
            type: YAst_1.YNodeType.STMT_RETURN,
            debugId: this.getDebugId(),
            startIndex: token.start,
            endIndex: token.end,
        };
    };
    // ==========================================
    // OPERATIONS (MATH, LOGIC, UNARY, LITERALS)
    // ==========================================
    YNodeFactory.prototype.getBinaryExpression = function (op, expression_left, expression_right) {
        return {
            type: YAst_1.YNodeType.EXP_BINARY,
            op: op,
            expLeft: expression_left,
            expRight: expression_right,
            debugId: this.getDebugId(),
            startIndex: expression_left.startIndex,
            endIndex: expression_right.endIndex,
        };
    };
    YNodeFactory.prototype.getUnaryExpression = function (op, expression, start, end) {
        return {
            type: YAst_1.YNodeType.EXP_UNARY,
            op: op,
            expression: expression,
            debugId: this.getDebugId(),
            startIndex: start,
            endIndex: end,
        };
    };
    YNodeFactory.prototype.getTernaryExpression = function (condition, true_statement, false_statement) {
        return {
            type: YAst_1.YNodeType.OP_TERNARY,
            condition: condition,
            true_statement: true_statement,
            false_statement: false_statement,
            debugId: this.getDebugId(),
            startIndex: condition.startIndex,
            endIndex: false_statement.endIndex,
        };
    };
    YNodeFactory.prototype.getPostfixOperation = function (operatorToken, operandNode) {
        return {
            type: YAst_1.YNodeType.OP_POSTFIX,
            operator: operatorToken,
            identifier: operandNode,
            debugId: this.getDebugId(),
            startIndex: operandNode.startIndex,
            endIndex: operatorToken.end,
        };
    };
    YNodeFactory.prototype.getLiteralNode = function (value, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.EXP_LITERAL,
            value: value,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    // ==========================================
    // DATA STRUCTURES (ARRAYS, OBJECTS)
    // ==========================================
    YNodeFactory.prototype.getArrayLiteral = function (elements) {
        var _a, _b, _c, _d;
        var startIndex = (_b = (_a = elements[0]) === null || _a === void 0 ? void 0 : _a.startIndex) !== null && _b !== void 0 ? _b : 0;
        var endIndex = (_d = (_c = elements[elements.length - 1]) === null || _c === void 0 ? void 0 : _c.endIndex) !== null && _d !== void 0 ? _d : 0;
        return {
            type: YAst_1.YNodeType.DEF_ARRAY,
            elements: elements,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getIndexOperation = function (operand, index) {
        return {
            type: YAst_1.YNodeType.OP_INDEXING,
            operand: operand,
            index: index,
            debugId: this.getDebugId(),
            startIndex: operand.startIndex,
            endIndex: operand.endIndex,
        };
    };
    YNodeFactory.prototype.getPropertyAccessExpression = function (curr, child) {
        return {
            type: YAst_1.YNodeType.EXP_PROPERTY_ACCESS,
            objectNode: curr,
            propertyNode: child,
            debugId: this.getDebugId(),
            startIndex: curr.startIndex,
            endIndex: child ? child.endIndex : curr.endIndex,
        };
    };
    // ==========================================
    // FUNCTIONS & CALLS
    // ==========================================
    YNodeFactory.prototype.getFunctionDefinition = function (identifier_name, params, block, startIndex, endIndex) {
        return {
            type: YAst_1.YNodeType.DEF_FUNCTION,
            identifier_name: identifier_name,
            params: params,
            block: block,
            debugId: this.getDebugId(),
            startIndex: startIndex,
            endIndex: endIndex,
        };
    };
    YNodeFactory.prototype.getCallNode = function (callee, args) {
        return {
            type: YAst_1.YNodeType.EXP_CALL,
            qualifiedName: callee,
            args: args,
            debugId: this.getDebugId(),
            startIndex: callee.startIndex,
            endIndex: callee.endIndex,
        };
    };
    // ==========================================
    // WRAPPERS
    // ==========================================
    YNodeFactory.prototype.getStatementExpression = function (exp) {
        return {
            type: YAst_1.YNodeType.STMT_EXPRESSION,
            exp: exp,
            debugId: this.getDebugId(),
            startIndex: exp.startIndex,
            endIndex: exp.endIndex,
        };
    };
    return YNodeFactory;
}());
exports.YNodeFactory = YNodeFactory;
