import type {YASLToken, YASLTokenBinaryOp, YASLTokenUnaryOp} from "./YASLToken";
import type {YASLNativeValue} from "./natives/YASLNativeValue";
import {
    type ArrayLiteralNode,
    type BinaryExpression,
    type BreakStatement,
    type CallNode,
    type ContinueStatement,
    type DeclarationStatement,
    type ElseIfStatement,
    type ElseStatement,
    type ForStatement,
    type FunctionDefinitionStatement,
    type IdentifierNode,
    type IfStatement,
    type IndexingOperation,
    type LiteralNode,
    type PostfixOperation,
    type PropertyAccessNode,
    type ReturnStatement,
    type SwitchCaseStatement,
    type SwitchStatement,
    type TernaryExpression,
    type ThenStatement,
    type UnaryExpression,
    type WhileStatement,
    type YASLAssignment,
    type YASLExpression,
    type YASLLValue,
    type YASLNode,
    YASLNodeType,
    type YASLValueType
} from "./tree";

export class YASLNodeFactory {
    private node_index = 0;

    getBinaryExpression(op: YASLTokenBinaryOp, expression_left: YASLExpression, expression_right: YASLExpression): BinaryExpression {
        return {
            op,
            expression_left,
            expression_right,
            type: YASLNodeType.BINARY_EXPRESSION,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: expression_left.start_index,
            end_index: expression_right.end_index
        };
    }

    getUnaryExpression(op: YASLTokenUnaryOp, expression: YASLExpression, start: number, end: number): UnaryExpression {
        return {
            op,
            expression,
            type: YASLNodeType.UNARY_EXPRESSION,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start,
            end_index: end
        };
    }

    getTernaryExpression(condition: YASLNode, true_statement: YASLNode, false_statement: YASLNode): TernaryExpression {
        return {
            condition,
            true_statement,
            false_statement,

            type: YASLNodeType.TERNARY_EXPRESSION,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: condition.start_index,
            end_index: condition.end_index

        };
    }

    getArrayLiteral(elements: YASLExpression[]): ArrayLiteralNode {
        return {
            debug_id: this.getDebugId(),
            end_index: 0,
            start_index: 0,
            type: YASLNodeType.ARRAY,
            next_node: null,
            elements
        };
    }

    getIndexOperation(operand: YASLExpression, index: YASLExpression): IndexingOperation{
        return {
            debug_id: this.getDebugId(),
            index,
            operand,

            type:YASLNodeType.IndexingOperation,
            start_index: operand.start_index,
            end_index:operand.end_index,
            next_node: null,
        }
    }

    // getBlockStatement(): BLockStatement {
    //     return {
    //         type     : YASLNodeType.BLOCK_STATEMENT,
    //         next_node: null
    //     };
    // }

    getLiteralNode(value: YASLNativeValue, valueType: YASLValueType, start_index: number, end_index: number): LiteralNode {
        return {
            value,
            valueType,
            type: YASLNodeType.LITERAL,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getIdentifierNode(name: YASLToken): IdentifierNode {
        const name_str = name.lexeme;
        return {
            name: name_str,
            type: YASLNodeType.IDENTIFIER,
            debug_id: this.getDebugId(),
            start_index: name.start,
            end_index: name.end,
            next_node: null
        };
    }

    getCallNode(callee: YASLExpression, args: YASLExpression[]): CallNode {
        return {
            type: YASLNodeType.CALL,
            qualifiedName: callee,
            debug_id: this.getDebugId(),
            start_index: callee.start_index,
            end_index: callee.end_index,
            args, next_node: null
        };
    }

    getBreakStatement(token: YASLToken): BreakStatement {
        return {
            type: YASLNodeType.BREAK_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: token.start,
            end_index: token.end
        };
    }

    getContinueStatement(token: YASLToken): ContinueStatement {
        return {
            type: YASLNodeType.CONTINUE_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: token.start,
            end_index: token.end
        };
    }

    getReturnStatement(token: YASLToken): ReturnStatement {
        return {
            type: YASLNodeType.RETURN_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: token.start,
            end_index: token.end
        };
    }

    getDeclarationStatement(identifier_name: string, value: YASLExpression | null, types: Set<YASLValueType> | null, start_index: number, end_index: number): DeclarationStatement {
        return {
            types,
            type: YASLNodeType.DECLARATION_STATEMENT,
            lvalue: identifier_name,
            rvalue: value,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getAssignmentExpression(assignment_token: YASLToken, lvalue: YASLExpression, rvalue: YASLExpression): YASLAssignment {
        return {
            type: YASLNodeType.ASSIGNMENT,
            lvalue: lvalue,
            operator: assignment_token,
            rvalue: rvalue,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: lvalue.start_index,
            end_index: rvalue.end_index
        };
    }

    getFunctionDefinition(identifier_name: string, params: YASLNode[], start_index: number, end_index: number): FunctionDefinitionStatement {
        return {
            identifier_name,
            params,
            type: YASLNodeType.FUNCTION_DEFINITION,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getForStatement(statement_1: YASLNode, statement_2: YASLNode, statement_3: YASLNode, start_index: number, end_index: number): ForStatement {
        return {
            statement_1,
            statement_2,
            statement_3,
            type: YASLNodeType.FOR_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getWhileStatement(expression_inside: YASLNode, start_index: number, end_index: number): WhileStatement {
        return {
            expression_inside,
            type: YASLNodeType.WHILE_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getIfStatement(expression_inside: YASLNode, start_index: number, end_index: number): IfStatement {
        return {
            expression_inside,
            next_node: null,
            type: YASLNodeType.IF_STATEMENT,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getElseIfStatement(expression_inside: YASLNode, start_index: number, end_index: number): ElseIfStatement {
        return {
            expression_inside,
            next_node: null,
            type: YASLNodeType.ELSE_IF_STATEMENT,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getElseStatement(start_index: number, end_index: number): ElseStatement {
        return {
            type: YASLNodeType.ELSE_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getThenStatement(start_index: number, end_index: number): ThenStatement {
        return {
            type: YASLNodeType.THEN_STATEMENT,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getSwitchStatement(expression_inside: YASLNode, start_index: number, end_index: number): SwitchStatement {
        return {
            expression_inside,
            next_node: null,
            type: YASLNodeType.SWITCH_STATEMENT,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getSwitchCaseStatement(expression_inside: YASLNode, start_index: number, end_index: number): SwitchCaseStatement {
        return {
            expression_inside,
            next_node: null,
            type: YASLNodeType.SWITCH_CASE_STATEMENT,
            debug_id: this.getDebugId(),
            start_index: start_index,
            end_index: end_index
        };
    }

    getPropertyAccessExpression(curr: YASLExpression, child?: YASLExpression): PropertyAccessNode {
        return {
            curr_node: curr,
            member_node: child,
            type: YASLNodeType.PROPERTY_ACCESS,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: curr.start_index,
            end_index: child ? child.end_index : curr.end_index
        };
    }

    getPostfixOperation(op_token: YASLToken, left_node: YASLNode): PostfixOperation {
        return {
            operator: op_token,
            identifier: left_node,
            type: YASLNodeType.POSTFIX_OPERATION,
            next_node: null,
            debug_id: this.getDebugId(),
            start_index: left_node.start_index,
            end_index: op_token.end
        };
    }

    private getDebugId() {
        return ++this.node_index;
    }
}