import { BinaryOperatorToken, Token, UnaryOperatorToken } from "@/yasl/token";


export type YASLExpression =
    UnaryExpression
    | BinaryExpression
    | YASLAssignment
    | LiteralNode
    | CallNode
    | IdentifierNode
    | PropertyAccessNode
    | PostfixOperation;
export type NativeValue = string | number | boolean | null;
export type YASLLValue = IdentifierNode | PropertyAccessNode;

export enum YASLNodeType {
    IDENTIFIER = "identifier",
    LITERAL = "literal",
    CALL = "call",
    BREAK_STATEMENT = "breakStatement",
    CONTINUE_STATEMENT = "continueStatement",
    DECLARATION_STATEMENT = "declarationStatement",
    ASSIGNMENT = "assignmentExpression",
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
    PROPERTY_ACCESS = "propertyAccess",
    POSTFIX_OPERATION = "postfixOperation"
}

export enum YASLValue {
    string = "string",
    number = "number",
    boolean = "boolean",
    queue = "Queue",
    set = "Set",
    array = "array",
    function_signature = "function",
    unset = "",
}


export interface PostfixOperation extends YASLNode {
    operator: Token;
    identifier: YASLNode;
}

export interface PropertyAccessNode extends YASLNode {
    parent_node: YASLLValue,
    child_node: IdentifierNode,
}

export interface YASLNode {
    type: YASLNodeType;
    next_node: YASLNode | null;
}

export interface BinaryExpression extends YASLNode {
    op: BinaryOperatorToken;
    expression_left: YASLExpression;
    expression_right: YASLExpression;
}

export interface UnaryExpression extends YASLNode {
    op: UnaryOperatorToken;
    expression: YASLExpression;
}

export interface BLockStatement extends YASLNode {

}

export interface TernaryExpression extends YASLNode {
    condition: YASLNode;
    true_statement: YASLNode;
    false_statement: YASLNode;
}

export interface LiteralNode extends YASLNode {
    value: NativeValue;
    valueType: YASLValue;
}

export interface IdentifierNode extends YASLNode {
    name: string;
}

export interface CallNode extends YASLNode {
    identifier: YASLLValue;
    args: YASLNode[];
}

export interface BreakStatement extends YASLNode {

}

export interface ContinueStatement extends YASLNode {

}

export interface ReturnStatement extends YASLNode {

}

export interface DeclarationStatement extends YASLNode {
    lvalue: string,
    rvalue: YASLExpression | null,
    types: Set<YASLValue> | null
}

export interface YASLAssignment extends YASLNode {
    operator: Token,
    lvalue: YASLLValue,
    rvalue: YASLExpression,
}

export interface FunctionDefinitionStatement extends YASLNode {
    identifier_name: string,
    params: YASLNode[],
}

export interface ForStatement extends YASLNode {
    statement_1: YASLNode;
    statement_2: YASLNode;
    statement_3: YASLNode;
}

export interface WhileStatement extends YASLNode {
    expression_inside: YASLNode;
}

export interface IfStatement extends YASLNode {
    expression_inside: YASLNode;
}

export interface ElseIfStatement extends YASLNode {
    expression_inside: YASLNode;
}

export interface ElseStatement extends YASLNode {

}

export interface ThenStatement extends YASLNode {

}

export interface SwitchStatement extends YASLNode {
    expression_inside: YASLNode;
}

export interface SwitchCaseStatement extends YASLNode {
    expression_inside: YASLNode;
}

export class YASLNodeTypeChecker {
    static isIdentifier(node: YASLNode): node is IdentifierNode {
        return node.type === YASLNodeType.IDENTIFIER;
    }

    static isPropertyAccess(node: YASLNode): node is PropertyAccessNode {
        return node.type === YASLNodeType.PROPERTY_ACCESS;
    }

    static isLValue(node: YASLNode): node is YASLLValue {
        return node.type === YASLNodeType.PROPERTY_ACCESS || node.type === YASLNodeType.IDENTIFIER;
    }

    static isExpression(node: YASLNode): node is YASLExpression {
        switch (node.type) {
            case YASLNodeType.BINARY_EXPRESSION:
            case YASLNodeType.ASSIGNMENT:
            case YASLNodeType.TERNARY_EXPRESSION:
            case YASLNodeType.UNARY_EXPRESSION:
            case YASLNodeType.LITERAL:
                return true;
            default:
                return false;
        }

    }
}

export class YASLProgram {

    private curr?: YASLNode | null = null;

    private _root: YASLNode | null = null;

    get root() {
        return this._root;
    }

    static getBinaryExpression(op: BinaryOperatorToken, expression_left: YASLExpression, expression_right: YASLExpression): BinaryExpression {
        return {
            op,
            type: YASLNodeType.BINARY_EXPRESSION,
            expression_left,
            expression_right
            , next_node: null
        };
    }

    static getUnaryExpression(op: UnaryOperatorToken, expression: YASLExpression): UnaryExpression {
        return {
            op,
            type: YASLNodeType.UNARY_EXPRESSION, expression, next_node: null
        };
    }

    static getBlockStatement(): BLockStatement {
        return {
            type: YASLNodeType.BLOCK_STATEMENT, next_node: null
        };
    }

    static getTernaryExpression(condition: YASLNode, true_statement: YASLNode, false_statement: YASLNode): TernaryExpression {
        return {
            type: YASLNodeType.TERNARY_EXPRESSION,
            condition,
            true_statement,
            false_statement, next_node: null
        };
    }

    static getLiteralNode(value: NativeValue, valueType: YASLValue): LiteralNode {
        return {
            type: YASLNodeType.LITERAL,
            value, valueType,
            next_node: null
        };
    }

    static getIdentifierNode(name: string): IdentifierNode {
        return {
            type: YASLNodeType.IDENTIFIER,
            name: name, next_node: null
        };
    }

    static getCallNode(identifier_node: YASLLValue, args: YASLNode[]): CallNode {
        return {
            type: YASLNodeType.CALL,
            identifier: identifier_node,
            args, next_node: null
        };
    }

    static getBreakStatement(): BreakStatement {
        return {
            type: YASLNodeType.BREAK_STATEMENT, next_node: null
        };
    }

    static getContinueStatement(): ContinueStatement {
        return {
            type: YASLNodeType.CONTINUE_STATEMENT, next_node: null
        };
    }

    static getReturnStatement(): ReturnStatement {
        return {
            type: YASLNodeType.RETURN_STATEMENT, next_node: null
        };
    }

    static getDeclarationStatement(identifier_name: string, value: YASLExpression | null, types: Set<YASLValue> | null): DeclarationStatement {
        return {
            type: YASLNodeType.DECLARATION_STATEMENT,
            lvalue: identifier_name,
            rvalue: value,
            types,
            next_node: null
        };
    }

    static getAssignmentExpression(assignment_token: Token, lvalue: YASLLValue, rvalue: YASLExpression): YASLAssignment {
        return {
            type: YASLNodeType.ASSIGNMENT,
            lvalue: lvalue,
            operator: assignment_token,
            rvalue: rvalue,
            next_node: null
        };
    }

    static getFunctionDefinition(identifier_name: string, params: YASLNode[]): FunctionDefinitionStatement {
        return {
            type: YASLNodeType.FUNCTION_DEFINITION,
            identifier_name,
            params, next_node: null
        };
    }

    static getForStatement(statement_1: YASLNode, statement_2: YASLNode, statement_3: YASLNode): ForStatement {
        return {
            type: YASLNodeType.FOR_STATEMENT,
            statement_1,
            statement_2,
            statement_3, next_node: null
        };
    }

    static getWhileStatement(expression_inside: YASLNode): WhileStatement {
        return {
            type: YASLNodeType.WHILE_STATEMENT,
            expression_inside, next_node: null
        };
    }

    static getIfStatement(expression_inside: YASLNode): IfStatement {
        return {
            type: YASLNodeType.IF_STATEMENT,
            expression_inside, next_node: null
        };
    }

    static getElseIfStatement(expression_inside: YASLNode): ElseIfStatement {
        return {
            type: YASLNodeType.ELSE_IF_STATEMENT,
            expression_inside, next_node: null
        };
    }

    static getElseStatement(): ElseStatement {
        return {
            type: YASLNodeType.ELSE_STATEMENT, next_node: null
        };
    }

    static getThenStatement(): ThenStatement {
        return {
            type: YASLNodeType.THEN_STATEMENT, next_node: null
        };
    }

    static getSwitchStatement(expression_inside: YASLNode): SwitchStatement {
        return {
            type: YASLNodeType.SWITCH_STATEMENT,
            expression_inside, next_node: null
        };
    }

    static getSwitchCaseStatement(expression_inside: YASLNode): SwitchCaseStatement {
        return {
            type: YASLNodeType.SWITCH_CASE_STATEMENT,
            expression_inside, next_node: null
        };
    }

    static getPropertyAccessExpression(parent: YASLLValue, child: IdentifierNode): PropertyAccessNode {
        return {
            type: YASLNodeType.PROPERTY_ACCESS,
            parent_node: parent,
            child_node: child,
            next_node: null
        };
    }

    static getPostfixOperation(op_token: Token, left_node: YASLNode): PostfixOperation {
        return {
            type: YASLNodeType.POSTFIX_OPERATION,
            operator: op_token,
            identifier: left_node,
            next_node: null
        };
    }

    addStatement(node: YASLNode) {
        if (this._root === null) {
            this._root = node;
            this.curr = node;
        } else {

            this.curr!.next_node = node;
            this.curr = node;
        }
    }

}
