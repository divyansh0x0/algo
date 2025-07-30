import { Token } from "@/motion/ast/token";

export namespace Ast {

    export enum NodeType {
        IDENTIFIER = "identifier",
        LITERAL = "literal",
        CALL = "call",
        BREAK_STATEMENT = "breakStatement",
        CONTINUE_STATEMENT = "continueStatement",
        DECLARATION_STATEMENT = "declarationStatement",
        ASSIGNMENT_EXPRESSION = "assignmentExpression",
        FUNCTION_DEFINITION = "functionDefinition",
        RETURN_STATEMENT = "returnStatement",
        FOR_STATEMENT = "forStatement",
        WHILE_STATEMENT = "whileStatement",
        THEN_STATEMENT = "thenStatement",
        IF_STATEMENT = "ifStatement",
        ELSE_STATEMENT = "elseStatement",
        ELSE_IF_STATEMENT = "elseIfStatement",
        SWITCH_STATEMENT = "switchStatement",
        SWITCH_CASE_STATEMENT = "switchCaseStatement",
        BINARY_EXPRESSION = "binaryExpression",
        UNARY_EXPRESSION = "unaryExpression",
        BLOCK_STATEMENT = "blockStatement",
        TERNARY_EXPRESSION = "ternaryExpression",
        PROPERTY_ACCESS_EXPRESSION = "propertyAccess",
        POSTFIX_OPERATION = "postfixOperation"
    }

    export enum ValueType {
        string = "string",
        int = "int",
        queue = "Queue",
        set = "Set",
        array = "array",
        function_signature = "function",
        unset = "",
    }

    export function isIdentifier(node: Ast.Node): node is Ast.IdentifierNode {
        return node.type === NodeType.IDENTIFIER;
    }

    export function isPropertyAccess(node: Ast.Node): node is Ast.PropertyAccessExpression {
        return node.type === NodeType.PROPERTY_ACCESS_EXPRESSION;
    }
    export interface PostfixOperation extends Node {
        operator: Token;
        identifier: Node;
    }

    export interface PropertyAccessExpression extends Node {
        parent_node: IdentifierNode | PropertyAccessExpression,
        child_node: IdentifierNode,
    }

    export interface Node {
        type: NodeType;
        next_node: Node | null;
    }

    export interface BinaryExpression extends Node {
        op: Token;
        expression_left: Node;
        expression_right: Node;
    }

    export interface UnaryExpression extends Node {
        op: Token;
        expression: Node;
    }

    export interface BLockStatement extends Node {

    }

    export interface TernaryExpression extends Node {
        condition: Node;
        true_statement: Node;
        false_statement: Node;
    }

    export interface LiteralNode extends Node {
        value: number | string | boolean | null;
    }

    export interface IdentifierNode extends Node {
        name: string;
    }

    export interface CallNode extends Node {
        identifier: Node;
        args: Node[];
    }

    export interface BreakStatement extends Node {

    }

    export interface ContinueStatement extends Node {

    }

    export interface ReturnStatement extends Node {

    }

    export interface DeclarationStatement extends Node {
        identifier_name: string,
        value: Node | null,
        types: Set<ValueType> | null
    }

    export interface AssignmentExpression extends Node {
        operator: Token,
        lvalue: IdentifierNode | PropertyAccessExpression,
        rvalue: Node,
    }

    export interface FunctionDefinitionStatement extends Node {
        identifier_name: string,
        params: Node[],
    }

    export interface ForStatement extends Node {
        statement_1: Node;
        statement_2: Node;
        statement_3: Node;
    }

    export interface WhileStatement extends Node {
        expression_inside: Node;
    }

    export interface IfStatement extends Node {
        expression_inside: Node;
    }

    export interface ElseIfStatement extends Node {
        expression_inside: Node;
    }

    export interface ElseStatement extends Node {

    }

    export interface ThenStatement extends Node {

    }

    export interface SwitchStatement extends Node {
        expression_inside: Node;
    }

    export interface SwitchCaseStatement extends Node {
        expression_inside: Node;
    }


    export function createBinaryExpression(op: Token, expression_left: Node, expression_right: Node): BinaryExpression {
        return {
            op,
            type: NodeType.BINARY_EXPRESSION,
            expression_left,
            expression_right
            , next_node: null
        };
    }

    export function createUnaryExpression(op: Token, expression: Node): UnaryExpression {
        return {
            op,
            type: NodeType.UNARY_EXPRESSION, expression, next_node: null
        };
    }

    export function createBlockStatement(): BLockStatement {
        return {
            type: NodeType.BLOCK_STATEMENT, next_node: null
        };
    }

    export function createTernaryExpression(condition: Node, true_statement: Node, false_statement: Node): TernaryExpression {
        return {
            type: NodeType.TERNARY_EXPRESSION,
            condition,
            true_statement,
            false_statement, next_node: null
        };
    }

    export function createLiteralNode(value: number | string | boolean | null): LiteralNode {
        return {
            type: NodeType.LITERAL,
            value, next_node: null
        };
    }

    export function createIdentifierNode(name: string): IdentifierNode {
        return {
            type: NodeType.IDENTIFIER,
            name: name, next_node: null
        };
    }

    export function createCallNode(name: Node, args: Node[]): CallNode {
        return {
            type: NodeType.CALL,
            identifier: name,
            args, next_node: null
        };
    }

    export function createBreakStatement(): BreakStatement {
        return {
            type: NodeType.BREAK_STATEMENT, next_node: null
        };
    }

    export function createContinueStatement(): ContinueStatement {
        return {
            type: NodeType.CONTINUE_STATEMENT, next_node: null
        };
    }

    export function createReturnStatement(): ReturnStatement {
        return {
            type: NodeType.RETURN_STATEMENT, next_node: null
        };
    }

    export function createDeclarationStatement(identifier_name: string, value: Node | null, types: Set<Ast.ValueType> | null): DeclarationStatement {
        return {
            type: NodeType.DECLARATION_STATEMENT,
            identifier_name,
            value,
            types, next_node: null
        };
    }

    export function createAssignmentExpression(assignment_token: Token, lvalue: IdentifierNode | PropertyAccessExpression, rvalue: Node): AssignmentExpression {
        return {
            type: NodeType.ASSIGNMENT_EXPRESSION,
            lvalue: lvalue,
            operator: assignment_token,
            rvalue: rvalue,
            next_node: null
        };
    }

    export function createFunctionDefinition(identifier_name: string, params: Node[]): FunctionDefinitionStatement {
        return {
            type: NodeType.FUNCTION_DEFINITION,
            identifier_name,
            params, next_node: null
        };
    }

    export function createForStatement(statement_1: Node, statement_2: Node, statement_3: Node): ForStatement {
        return {
            type: NodeType.FOR_STATEMENT,
            statement_1,
            statement_2,
            statement_3, next_node: null
        };
    }

    export function createWhileStatement(expression_inside: Node): WhileStatement {
        return {
            type: NodeType.WHILE_STATEMENT,
            expression_inside, next_node: null
        };
    }

    export function createIfStatement(expression_inside: Node): IfStatement {
        return {
            type: NodeType.IF_STATEMENT,
            expression_inside, next_node: null
        };
    }

    export function createElseIfStatement(expression_inside: Node): ElseIfStatement {
        return {
            type: NodeType.ELSE_IF_STATEMENT,
            expression_inside, next_node: null
        };
    }

    export function createElseStatement(): ElseStatement {
        return {
            type: NodeType.ELSE_STATEMENT, next_node: null
        };
    }

    export function createThenStatement(): ThenStatement {
        return {
            type: NodeType.THEN_STATEMENT, next_node: null
        };
    }

    export function createSwitchStatement(expression_inside: Node): SwitchStatement {
        return {
            type: NodeType.SWITCH_STATEMENT,
            expression_inside, next_node: null
        };
    }

    export function createSwitchCaseStatement(expression_inside: Node): SwitchCaseStatement {
        return {
            type: NodeType.SWITCH_CASE_STATEMENT,
            expression_inside, next_node: null
        };
    }

    export function createPropertyAccessExpression(parent: IdentifierNode | PropertyAccessExpression, child: Ast.IdentifierNode): PropertyAccessExpression {
        return {
            type: NodeType.PROPERTY_ACCESS_EXPRESSION,
            parent_node: parent,
            child_node: child,
            next_node: null
        };
    }

    export function createPostfixOperation(op_token: Token, left_node: Ast.Node): PostfixOperation {
        return {
            type: NodeType.POSTFIX_OPERATION,
            operator: op_token,
            identifier: left_node,
            next_node: null
        };
    }

}
