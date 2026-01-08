import {
    StmtAssignNode,
    StmtExpressionNode,
    type YASLNode
} from "./YASLNode";
import {
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
    StmtWhileNode
} from "./YASLNode";
import type { YASLNativeValue } from "./natives/YASLNativeValue";
import type { YASLExpression, YASLValueType, } from "./YASLAst";
import type { YASLToken, YASLTokenBinaryOp, YASLTokenUnaryOp, } from "./YASLToken";

export class YASLNodeFactory {
    private node_index = 0;

    getBinaryExpression(
        op: YASLTokenBinaryOp,
        expression_left: YASLExpression,
        expression_right: YASLExpression,
    ): ExpBinaryNode {
        return new ExpBinaryNode(
            op,
            expression_left,
            expression_right,
            this.getDebugId(),
            expression_left.startIndex,
            expression_right.endIndex,
        );
    }

    getUnaryExpression(
        op: YASLTokenUnaryOp,
        expression: YASLExpression,
        start: number,
        end: number,
    ): ExpUnaryNode {
        return new ExpUnaryNode(op, expression, this.getDebugId(), start, end);
    }

    getTernaryExpression(
        condition: YASLNode,
        true_statement: YASLNode,
        false_statement: YASLNode,
    ): ExpTernaryNode {
        return new ExpTernaryNode(
            condition,
            true_statement,
            false_statement,
            this.getDebugId(),
            condition.startIndex,
            condition.endIndex,
        );
    }

    getArrayLiteral(elements: YASLExpression[]): DefArrayNode {
        const startIndex = elements[0]?.startIndex ?? 0;
        const endIndex = elements[elements.length - 1]?.endIndex ?? 0;
        return new DefArrayNode(
            elements,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getIndexOperation(
        operand: YASLExpression,
        index: YASLExpression,
    ): OpIndexingNode {
        return new OpIndexingNode(
            index,
            operand,
            this.getDebugId(),
            operand.startIndex,
            operand.endIndex,
        );
    }

    getLiteralNode(
        value: YASLNativeValue,
        startIndex: number,
        endIndex: number,
    ): ExpLiteralNode {
        return new ExpLiteralNode(
            value,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getIdentifierNode(name: YASLToken): ExpIdentifierNode {
        const name_str = name.lexeme;
        return new ExpIdentifierNode(
            name_str,
            this.getDebugId(),
            name.start,
            name.end,
        );
    }

    getCallNode(callee: YASLExpression, args: YASLExpression[]): ExpCallNode {
        return new ExpCallNode(
            callee,
            args,
            this.getDebugId(),
            callee.startIndex,
            callee.endIndex,
        );
    }

    getBreakStatement(token: YASLToken): StmtBreakNode {
        return new StmtBreakNode(this.getDebugId(), token.start, token.end);
    }

    getContinueStatement(token: YASLToken): StmtContinueNode {
        return new StmtContinueNode(this.getDebugId(), token.start, token.end);
    }

    getReturnStatement(token: YASLToken): StmtReturnNode {
        return new StmtReturnNode(this.getDebugId(), token.start, token.end);
    }

    getDeclarationStatement(
        identifier_name: string,
        value: YASLExpression | null,
        types: Set<YASLValueType> | null,
        startIndex: number,
        endIndex: number,
    ): StmtDeclarationNode {
        return new StmtDeclarationNode(
            identifier_name,
            value,
            types,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getAssignmentExpression(
        lvalue: YASLExpression,
        rvalue: YASLExpression,
    ): ExpAssignNode {
        return new ExpAssignNode(
            lvalue,
            rvalue,
            this.getDebugId(),
            lvalue.startIndex,
            rvalue.endIndex,
        );
    }
    getAssignmentStatement(
        lvalue: YASLExpression,
        rvalue: YASLExpression,
    ): StmtAssignNode {
        return new StmtAssignNode(
            lvalue,
            rvalue,
            this.getDebugId(),
            lvalue.startIndex,
            rvalue.endIndex,
        );
    }
    getFunctionDefinition(
        identifier_name: string,
        params: YASLNode[],
        startIndex: number,
        endIndex: number,
    ): DefFunctionNode {
        return new DefFunctionNode(
            identifier_name,
            params,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getForStatement(
        statement_1: YASLNode,
        statement_2: YASLNode,
        statement_3: YASLNode,
        startIndex: number,
        endIndex: number,
    ): StmtForNode {
        return new StmtForNode(
            statement_1,
            statement_2,
            statement_3,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getWhileStatement(
        expression_inside: YASLNode,
        startIndex: number,
        endIndex: number,
    ): StmtWhileNode {
        return new StmtWhileNode(
            expression_inside,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getIfStatement(
        expression_inside: YASLNode,
        startIndex: number,
        endIndex: number,
    ): StmtIfNode {
        return new StmtIfNode(
            expression_inside,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getElseIfStatement(
        expression_inside: YASLNode,
        startIndex: number,
        endIndex: number,
    ): StmtElseIfNode {
        return new StmtElseIfNode(
            expression_inside,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getElseStatement(startIndex: number, endIndex: number): StmtElseNode {
        return new StmtElseNode(this.getDebugId(), startIndex, endIndex);
    }

    getThenStatement(startIndex: number, endIndex: number): StmtThenNode {
        return new StmtThenNode(this.getDebugId(), startIndex, endIndex);
    }

    getSwitchStatement(
        expression_inside: YASLNode,
        startIndex: number,
        endIndex: number,
    ): StmtSwitchNode {
        return new StmtSwitchNode(
            expression_inside,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getSwitchCaseStatement(
        expression_inside: YASLNode,
        startIndex: number,
        endIndex: number,
    ): StmtCaseNode {
        return new StmtCaseNode(
            expression_inside,
            this.getDebugId(),
            startIndex,
            endIndex,
        );
    }

    getPropertyAccessExpression(
        curr: YASLExpression,
        child?: YASLExpression,
    ): ExpPropertyAccessNode {
        return new ExpPropertyAccessNode(
            curr,
            child,
            this.getDebugId(),
            curr.startIndex,
            child ? child.endIndex : curr.endIndex,
        );
    }

    getPostfixOperation(
        operatorToken: YASLToken,
        operandNode: YASLNode,
    ): OpPostfixNode {
        return new OpPostfixNode(
            operatorToken,
            operandNode,
            this.getDebugId(),
            operandNode.startIndex,
            operatorToken.end,
        );
    }

    private getDebugId() {
        return ++this.node_index;
    }

    getStatementExpression(exp: YASLExpression): StmtExpressionNode {
        return new StmtExpressionNode(exp, this.getDebugId(), exp.startIndex, exp.endIndex);
    }
}
