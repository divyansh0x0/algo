import { YNodeType } from "./YAst";
import type {
    StmtAssignNode,
    StmtExpressionNode,
    YNode,
    DefArrayNode,
    DefFunctionNode,
    ExpAssignNode,
    ExpBinaryNode,
    ExpCallNode,
    ExpIdentifierNode,
    ExpLiteralNode,
    ExpPropertyAccessNode,
    ExpTernaryNode,
    ExpUnaryNode,
    OpIndexingNode,
    OpPostfixNode,
    StmtBreakNode,
    StmtCaseNode,
    StmtContinueNode,
    StmtDeclarationNode,
    StmtElseIfNode,
    StmtElseNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    ExpParameterNode,
    ExpBlockNode,
    StmtDefaultNode
} from "./YNode";
import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
import type { YExpression, YValueType } from "./YAst";
import type { YToken, YTokenBinaryOp, YTokenUnaryOp } from "./YToken";

export class YNodeFactory {
    private node_index = 0;

    private getDebugId() {
        return ++this.node_index;
    }

    // ==========================================
    // VARIABLES & SCOPE (DECLARATIONS, IDENTIFIERS)
    // ==========================================

    getDeclarationStatement(
        identifier_name: string,
        value: YExpression | null,
        types: Set<YValueType> | null,
        startIndex: number,
        endIndex: number,
    ): StmtDeclarationNode {
        return {
            type: YNodeType.STMT_DECLARATION,
            lvalue: identifier_name,
            rvalue: value,
            types,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getAssignmentStatement(
        lvalue: YExpression,
        rvalue: YExpression,
    ): StmtAssignNode {
        return {
            type: YNodeType.STMT_ASSIGN,
            lvalue,
            rvalue,
            debugId: this.getDebugId(),
            startIndex: lvalue.startIndex,
            endIndex: rvalue.endIndex,
        };
    }

    getAssignmentExpression(
        lvalue: YExpression,
        rvalue: YExpression,
    ): ExpAssignNode {
        return {
            type: YNodeType.EXP_ASSIGN,
            lvalue,
            rvalue,
            debugId: this.getDebugId(),
            startIndex: lvalue.startIndex,
            endIndex: rvalue.endIndex,
        };
    }

    getIdentifierNode(name: YToken): ExpIdentifierNode {
        const name_str = name.lexeme;
        return {
            type: YNodeType.EXP_IDENTIFIER,
            name: name_str,
            debugId: this.getDebugId(),
            startIndex: name.start,
            endIndex: name.end,
        };
    }

    // ==========================================
    // CONTROL FLOW (BLOCKS, CONDITIONS, LOOPS)
    // ==========================================

    getIfStatement(
        condition: YExpression,
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): StmtIfNode {
        return {
            type: YNodeType.STMT_IF,
            condition,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getElseIfStatement(
        condition: YExpression,
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): StmtElseIfNode {
        return {
            type: YNodeType.STMT_ELSE_IF,
            condition,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getElseStatement(
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): StmtElseNode {
        return {
            type: YNodeType.STMT_ELSE,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getThenStatement(
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number
    ): StmtThenNode {
        return {
            type: YNodeType.STMT_THEN,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getWhileStatement(
        condition: YExpression,
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): StmtWhileNode {
        return {
            type: YNodeType.STMT_WHILE,
            condition,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getForStatement(
        init_statement: YExpression,
        condition: YExpression,
        increment_statement: YExpression,
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): StmtForNode {
        return {
            type: YNodeType.STMT_FOR,
            init_statement,
            condition,
            increment_statement,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getSwitchStatement(
        condition: YExpression,
        cases: StmtCaseNode[],
        default_stmt: StmtDefaultNode,
        startIndex: number,
        endIndex: number,
    ): StmtSwitchNode {
        return {
            type: YNodeType.STMT_SWITCH,
            condition,
            cases,
            default_stmt,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getSwitchCaseStatement(
        condition: YExpression,
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): StmtCaseNode {
        return {
            type: YNodeType.STMT_CASE,
            condition,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getBreakStatement(token: YToken): StmtBreakNode {
        return {
            type: YNodeType.STMT_BREAK,
            debugId: this.getDebugId(),
            startIndex: token.start,
            endIndex: token.end,
        };
    }

    getContinueStatement(token: YToken): StmtContinueNode {
        return {
            type: YNodeType.STMT_CONTINUE,
            debugId: this.getDebugId(),
            startIndex: token.start,
            endIndex: token.end,
        };
    }

    getReturnStatement(token: YToken): StmtReturnNode {
        return {
            type: YNodeType.STMT_RETURN,
            debugId: this.getDebugId(),
            startIndex: token.start,
            endIndex: token.end,
        };
    }

    // ==========================================
    // OPERATIONS (MATH, LOGIC, UNARY, LITERALS)
    // ==========================================

    getBinaryExpression(
        op: YTokenBinaryOp,
        expression_left: YExpression,
        expression_right: YExpression,
    ): ExpBinaryNode {
        return {
            type: YNodeType.EXP_BINARY,
            op,
            expLeft: expression_left,
            expRight: expression_right,
            debugId: this.getDebugId(),
            startIndex: expression_left.startIndex,
            endIndex: expression_right.endIndex,
        };
    }

    getUnaryExpression(
        op: YTokenUnaryOp,
        expression: YExpression,
        start: number,
        end: number,
    ): ExpUnaryNode {
        return {
            type: YNodeType.EXP_UNARY,
            op,
            expression,
            debugId: this.getDebugId(),
            startIndex: start,
            endIndex: end,
        };
    }

    getTernaryExpression(
        condition: YExpression,
        true_statement: YExpression,
        false_statement: YExpression,
    ): ExpTernaryNode {
        return {
            type: YNodeType.OP_TERNARY,
            condition,
            true_statement,
            false_statement,
            debugId: this.getDebugId(),
            startIndex: condition.startIndex,
            endIndex: false_statement.endIndex,
        };
    }

    getPostfixOperation(
        operatorToken: YToken,
        operandNode: YNode,
    ): OpPostfixNode {
        return {
            type: YNodeType.OP_POSTFIX,
            operator: operatorToken,
            identifier: operandNode,
            debugId: this.getDebugId(),
            startIndex: operandNode.startIndex,
            endIndex: operatorToken.end,
        };
    }

    getLiteralNode(
        value: YNativeValueWrapper,
        startIndex: number,
        endIndex: number,
    ): ExpLiteralNode {
        return {
            type: YNodeType.EXP_LITERAL,
            value,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    // ==========================================
    // DATA STRUCTURES (ARRAYS, OBJECTS)
    // ==========================================

    getArrayLiteral(elements: YExpression[]): DefArrayNode {
        const startIndex = elements[0]?.startIndex ?? 0;
        const endIndex = elements[elements.length - 1]?.endIndex ?? 0;
        return {
            type: YNodeType.DEF_ARRAY,
            elements,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getIndexOperation(
        operand: YExpression,
        index: YExpression,
    ): OpIndexingNode {
        return {
            type: YNodeType.OP_INDEXING,
            operand,
            index,
            debugId: this.getDebugId(),
            startIndex: operand.startIndex,
            endIndex: operand.endIndex,
        };
    }

    getPropertyAccessExpression(
        curr: YExpression,
        child?: YExpression,
    ): ExpPropertyAccessNode {
        return {
            type: YNodeType.EXP_PROPERTY_ACCESS,
            objectNode: curr,
            propertyNode: child,
            debugId: this.getDebugId(),
            startIndex: curr.startIndex,
            endIndex: child ? child.endIndex : curr.endIndex,
        };
    }

    // ==========================================
    // FUNCTIONS & CALLS
    // ==========================================

    getFunctionDefinition(
        identifier_name: string,
        params: ExpParameterNode[],
        block: ExpBlockNode,
        startIndex: number,
        endIndex: number,
    ): DefFunctionNode {
        return {
            type: YNodeType.DEF_FUNCTION,
            identifier_name,
            params,
            block,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getCallNode(callee: YExpression, args: YExpression[]): ExpCallNode {
        return {
            type: YNodeType.EXP_CALL,
            qualifiedName: callee,
            args,
            debugId: this.getDebugId(),
            startIndex: callee.startIndex,
            endIndex: callee.endIndex,
        };
    }

    // ==========================================
    // WRAPPERS
    // ==========================================

    getStatementExpression(exp: YExpression): StmtExpressionNode {
        return {
            type: YNodeType.STMT_EXPRESSION,
            exp,
            debugId: this.getDebugId(),
            startIndex: exp.startIndex,
            endIndex: exp.endIndex,
        };
    }
}
