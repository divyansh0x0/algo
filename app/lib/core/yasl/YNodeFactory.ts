import {
    StmtAssignNode,
    StmtExpressionNode,
    type YNode
} from "./YNode";
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
} from "./YNode";
import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
import type { YExpression, YValueType, } from "./YAst";
import type { YToken, YTokenBinaryOp, YTokenUnaryOp, } from "./YToken";

export class YNodeFactory {
    private node_index = 0;

    getBinaryExpression(
        op: YTokenBinaryOp,
        expression_left: YExpression,
        expression_right: YExpression,
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
        op: YTokenUnaryOp,
        expression: YExpression,
        start: number,
        end: number,
    ): ExpUnaryNode {
        return new ExpUnaryNode(op, expression, this.getDebugId(), start, end);
    }

    getTernaryExpression(
        condition: YNode,
        true_statement: YNode,
        false_statement: YNode,
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

    getArrayLiteral(elements: YExpression[]): DefArrayNode {
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
        operand: YExpression,
        index: YExpression,
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
        value: YNativeValueWrapper,
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

    getIdentifierNode(name: YToken): ExpIdentifierNode {
        const name_str = name.lexeme;
        return new ExpIdentifierNode(
            name_str,
            this.getDebugId(),
            name.start,
            name.end,
        );
    }

    getCallNode(callee: YExpression, args: YExpression[]): ExpCallNode {
        return new ExpCallNode(
            callee,
            args,
            this.getDebugId(),
            callee.startIndex,
            callee.endIndex,
        );
    }

    getBreakStatement(token: YToken): StmtBreakNode {
        return new StmtBreakNode(this.getDebugId(), token.start, token.end);
    }

    getContinueStatement(token: YToken): StmtContinueNode {
        return new StmtContinueNode(this.getDebugId(), token.start, token.end);
    }

    getReturnStatement(token: YToken): StmtReturnNode {
        return new StmtReturnNode(this.getDebugId(), token.start, token.end);
    }

    getDeclarationStatement(
        identifier_name: string,
        value: YExpression | null,
        types: Set<YValueType> | null,
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
        lvalue: YExpression,
        rvalue: YExpression,
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
        lvalue: YExpression,
        rvalue: YExpression,
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
        params: YNode[],
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
        statement_1: YNode,
        statement_2: YNode,
        statement_3: YNode,
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
        expression_inside: YNode,
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
        expression_inside: YNode,
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
        expression_inside: YNode,
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
        expression_inside: YNode,
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
        expression_inside: YNode,
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
        curr: YExpression,
        child?: YExpression,
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
        operatorToken: YToken,
        operandNode: YNode,
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

    getStatementExpression(exp: YExpression): StmtExpressionNode {
        return new StmtExpressionNode(exp, this.getDebugId(), exp.startIndex, exp.endIndex);
    }
}
