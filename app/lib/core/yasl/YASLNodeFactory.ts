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
    StmtWhileNode,
    YASLNode
} from "~/lib/core/yasl/YASLNode";
import type { YASLNativeValue } from "./natives/YASLNativeValue";
import { type YASLExpression, type YASLValueType, } from "./YASLAst";
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
            expression_left.start_index,
            expression_right.end_index,
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
            condition.start_index,
            condition.end_index,
        );
    }

    getArrayLiteral(elements: YASLExpression[]): DefArrayNode {
        const startIndex = elements[0]?.start_index ?? 0;
        const endIndex = elements[elements.length - 1]?.end_index ?? 0;
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
            operand.start_index,
            operand.end_index,
        );
    }

    getLiteralNode(
        value: YASLNativeValue,
        valueType: YASLValueType,
        start_index: number,
        end_index: number,
    ): ExpLiteralNode {
        return new ExpLiteralNode(
            value,
            valueType,
            this.getDebugId(),
            start_index,
            end_index,
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
            callee.start_index,
            callee.end_index,
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
        start_index: number,
        end_index: number,
    ): StmtDeclarationNode {
        return new StmtDeclarationNode(
            identifier_name,
            value,
            types,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getAssignmentExpression(
        assignmentOperatorToken: YASLToken,
        lvalue: YASLExpression,
        rvalue: YASLExpression,
    ): ExpAssignNode {
        return new ExpAssignNode(
            assignmentOperatorToken,
            lvalue,
            rvalue,
            this.getDebugId(),
            lvalue.start_index,
            rvalue.end_index,
        );
    }

    getFunctionDefinition(
        identifier_name: string,
        params: YASLNode[],
        start_index: number,
        end_index: number,
    ): DefFunctionNode {
        return new DefFunctionNode(
            identifier_name,
            params,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getForStatement(
        statement_1: YASLNode,
        statement_2: YASLNode,
        statement_3: YASLNode,
        start_index: number,
        end_index: number,
    ): StmtForNode {
        return new StmtForNode(
            statement_1,
            statement_2,
            statement_3,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getWhileStatement(
        expression_inside: YASLNode,
        start_index: number,
        end_index: number,
    ): StmtWhileNode {
        return new StmtWhileNode(
            expression_inside,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getIfStatement(
        expression_inside: YASLNode,
        start_index: number,
        end_index: number,
    ): StmtIfNode {
        return new StmtIfNode(
            expression_inside,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getElseIfStatement(
        expression_inside: YASLNode,
        start_index: number,
        end_index: number,
    ): StmtElseIfNode {
        return new StmtElseIfNode(
            expression_inside,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getElseStatement(start_index: number, end_index: number): StmtElseNode {
        return new StmtElseNode(this.getDebugId(), start_index, end_index);
    }

    getThenStatement(start_index: number, end_index: number): StmtThenNode {
        return new StmtThenNode(this.getDebugId(), start_index, end_index);
    }

    getSwitchStatement(
        expression_inside: YASLNode,
        start_index: number,
        end_index: number,
    ): StmtSwitchNode {
        return new StmtSwitchNode(
            expression_inside,
            this.getDebugId(),
            start_index,
            end_index,
        );
    }

    getSwitchCaseStatement(
        expression_inside: YASLNode,
        start_index: number,
        end_index: number,
    ): StmtCaseNode {
        return new StmtCaseNode(
            expression_inside,
            this.getDebugId(),
            start_index,
            end_index,
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
            curr.start_index,
            child ? child.end_index : curr.end_index,
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
            operandNode.start_index,
            operatorToken.end,
        );
    }

    private getDebugId() {
        return ++this.node_index;
    }
}
