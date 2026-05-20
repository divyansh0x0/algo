import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
import type { YExpression, YLValue, YStatement, YValueType } from "./YAst";
import { YNodeType } from "./YAst";
import type {
    DefArrayNode,
    DefFunctionNode,
    ExpAssignNode,
    ExpBinaryNode,
    ExpBlockNode,
    ExpCallNode,
    ExpIdentifierNode,
    ExpIfNode,
    ExpLiteralNode,
    ExpParameterNode,
    ExpPropertyAccessNode,
    ExpTernaryNode,
    ExpUnaryNode,
    OpIndexingNode,
    OpPostfixNode,
    StmtAssignNode,
    StmtBreakNode,
    StmtCaseNode,
    StmtContinueNode,
    StmtDeclarationNode,
    StmtDefaultNode,
    StmtElseNode,
    StmtExpressionNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode
} from "./YNode";
import type { YToken, YTokenBinaryOp, YTokenUnaryOp } from "./YToken";

export class YNodeFactory {
    private node_index = 0;

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

    // ==========================================
    // VARIABLES & SCOPE (DECLARATIONS, IDENTIFIERS)
    // ==========================================

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

    getBlockExpression(statements: YStatement[], startIndex: number,
                       endIndex: number
    ): ExpBlockNode {
        return {
            type: YNodeType.EXP_BLOCK,
            statements,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    // ==========================================
    // CONTROL FLOW (BLOCKS, CONDITIONS, LOOPS)
    // ==========================================

    getIfStatement(
        condition: YExpression,
        truthyBody: YStatement,
        falsyBody: YStatement | null,
        startIndex: number,
        endIndex: number,
    ): StmtIfNode {
        return {
            type: YNodeType.STMT_IF,
            condition,
            truthyBody,
            falsyBody,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getIfExpression(
        condition: YExpression,
        truthyResult: YExpression,
        falsyResult: YExpression,
        startIndex: number,
        endIndex: number,
    ): ExpIfNode {
        return {
            type: YNodeType.EXP_IF,
            condition,
            truthyResult,
            falsyResult,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getElseStatement(
        body: YExpression,
        startIndex: number,
        endIndex: number,
    ): StmtElseNode {
        return {
            type: YNodeType.STMT_ELSE,
            body,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getThenStatement(
        body: YExpression,
        startIndex: number,
        endIndex: number
    ): StmtThenNode {
        return {
            type: YNodeType.STMT_THEN,
            body,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getWhileStatement(
        condition: YExpression,
        body: YExpression,
        startIndex: number,
        endIndex: number,
    ): StmtWhileNode {
        return {
            type: YNodeType.STMT_WHILE,
            condition,
            body,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

    getForStatement(
        init_statement: StmtExpressionNode | StmtAssignNode | StmtDeclarationNode,
        condition: YExpression,
        increment_statement: StmtExpressionNode | StmtAssignNode,
        body: YExpression,
        startIndex: number,
        endIndex: number,
    ): StmtForNode {
        return {
            type: YNodeType.STMT_FOR,
            init_statement,
            condition,
            increment_statement,
            body,
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
        body: YExpression,
        startIndex: number,
        endIndex: number,
    ): StmtCaseNode {
        return {
            type: YNodeType.STMT_CASE,
            condition,
            body,
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

    getReturnStatement(returnValue: YExpression | null, startIndex: number, endIndex: number): StmtReturnNode {
        return {
            type: YNodeType.STMT_RETURN,
            returnValue,
            debugId: this.getDebugId(),
            startIndex,
            endIndex,
        };
    }

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

    // ==========================================
    // OPERATIONS (MATH, LOGIC, UNARY, LITERALS)
    // ==========================================

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
        operandNode: YLValue,
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

    // ==========================================
    // DATA STRUCTURES (ARRAYS, OBJECTS)
    // ==========================================

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

    // ==========================================
    // FUNCTIONS & CALLS
    // ==========================================

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

    getStatementExpression(exp: YExpression): StmtExpressionNode {
        return {
            type: YNodeType.STMT_EXPRESSION,
            exp,
            debugId: this.getDebugId(),
            startIndex: exp.startIndex,
            endIndex: exp.endIndex,
        };
    }

    // ==========================================
    // WRAPPERS
    // ==========================================

    private getDebugId() {
        return ++this.node_index;
    }
}
