import { BinaryOperatorToken, UnaryOperatorToken, YASLToken } from "@/yasl/YASLToken";


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
    IDENTIFIER          = "identifier",
    LITERAL             = "literal",
    CALL                = "call",
    BREAK_STATEMENT     = "breakStatement",
    CONTINUE_STATEMENT  = "continueStatement",
    DECLARATION_STATEMENT = "declarationStatement",
    ASSIGNMENT          = "assignmentExpression",
    FUNCTION_DEFINITION = "functionDefinition",
    RETURN_STATEMENT    = "returnStatement",
    FOR_STATEMENT       = "forStatement",
    WHILE_STATEMENT     = "whileStatement",
    THEN_STATEMENT      = "thenStatement",
    IF_STATEMENT        = "ifStatement",
    ELSE_STATEMENT      = "elseStatement",
    ELSE_IF_STATEMENT   = "elseIfStatement",
    SWITCH_STATEMENT    = "switchStatement",
    SWITCH_CASE_STATEMENT = "switchCaseStatement",
    BINARY_EXPRESSION   = "binaryExpression",
    UNARY_EXPRESSION    = "unaryExpression",
    BLOCK_STATEMENT     = "blockStatement",
    TERNARY_EXPRESSION  = "ternaryExpression",
    PROPERTY_ACCESS     = "propertyAccess",
    POSTFIX_OPERATION   = "postfixOperation"
}

export enum YASLValueType {
    string  = "string",
    number  = "number",
    boolean = "boolean",
    queue   = "Queue",
    set     = "Set",
    array   = "array",
    function_signature = "function",
    unset   = "",
}


export interface PostfixOperation extends YASLNode {
    operator: YASLToken;
    identifier: YASLNode;
}

export interface PropertyAccessNode extends YASLNode {
    parent_node: YASLLValue,
    child_node: IdentifierNode,
}

export interface YASLNode {
    type: YASLNodeType;
    next_node: YASLNode | null;
    debug_id: number;
    start_index: number;
    end_index: number;
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
    valueType: YASLValueType;
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
    types: Set<YASLValueType> | null
}

export interface YASLAssignment extends YASLNode {
    operator: YASLToken,
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

export class YASLNodeFactory {
    private node_index = 0;

    getBinaryExpression(op: BinaryOperatorToken, expression_left: YASLExpression, expression_right: YASLExpression): BinaryExpression {
        return {
            op,
            expression_left,
            expression_right,
            type       : YASLNodeType.BINARY_EXPRESSION,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: expression_left.start_index,
            end_index  : expression_right.end_index
        };
    }

    getUnaryExpression(op: UnaryOperatorToken, expression: YASLExpression, start: number, end: number): UnaryExpression {
        return {
            op,
            expression,
            type       : YASLNodeType.UNARY_EXPRESSION,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start,
            end_index  : end
        };
    }

    getTernaryExpression(condition: YASLNode, true_statement: YASLNode, false_statement: YASLNode): TernaryExpression {
        return {
            condition,
            true_statement,
            false_statement,

            type       : YASLNodeType.TERNARY_EXPRESSION,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: condition.start_index,
            end_index  : condition.end_index

        };
    }

    // getBlockStatement(): BLockStatement {
    //     return {
    //         type     : YASLNodeType.BLOCK_STATEMENT,
    //         next_node: null
    //     };
    // }

    getLiteralNode(value: NativeValue, valueType: YASLValueType, start_index: number, end_index: number): LiteralNode {
        return {
            value,
            valueType,
            type       : YASLNodeType.LITERAL,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getIdentifierNode(name: YASLToken): IdentifierNode {
        const name_str = name.lexeme;
        return {
            name       : name_str,
            type       : YASLNodeType.IDENTIFIER,
            debug_id   : this.getDebugId(),
            start_index: name.start,
            end_index  : name.end,
            next_node  : null
        };
    }

    getCallNode(identifier_node: YASLLValue, args: YASLNode[]): CallNode {
        return {
            type       : YASLNodeType.CALL,
            identifier : identifier_node,
            debug_id   : this.getDebugId(),
            start_index: identifier_node.start_index,
            end_index  : identifier_node.end_index,
            args, next_node: null
        };
    }

    getBreakStatement(token: YASLToken): BreakStatement {
        return {
            type       : YASLNodeType.BREAK_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: token.start,
            end_index  : token.end
        };
    }

    getContinueStatement(token: YASLToken): ContinueStatement {
        return {
            type       : YASLNodeType.CONTINUE_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: token.start,
            end_index  : token.end
        };
    }

    getReturnStatement(token: YASLToken): ReturnStatement {
        return {
            type       : YASLNodeType.RETURN_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: token.start,
            end_index  : token.end
        };
    }

    getDeclarationStatement(identifier_name: string, value: YASLExpression | null, types: Set<YASLValueType> | null, start_index: number, end_index: number): DeclarationStatement {
        return {
            types,
            type       : YASLNodeType.DECLARATION_STATEMENT,
            lvalue     : identifier_name,
            rvalue     : value,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getAssignmentExpression(assignment_token: YASLToken, lvalue: YASLLValue, rvalue: YASLExpression): YASLAssignment {
        return {
            type       : YASLNodeType.ASSIGNMENT,
            lvalue     : lvalue,
            operator   : assignment_token,
            rvalue     : rvalue,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: lvalue.start_index,
            end_index  : rvalue.end_index
        };
    }

    getFunctionDefinition(identifier_name: string, params: YASLNode[], start_index: number, end_index: number): FunctionDefinitionStatement {
        return {
            identifier_name,
            params,
            type       : YASLNodeType.FUNCTION_DEFINITION,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getForStatement(statement_1: YASLNode, statement_2: YASLNode, statement_3: YASLNode, start_index: number, end_index: number): ForStatement {
        return {
            statement_1,
            statement_2,
            statement_3,
            type       : YASLNodeType.FOR_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getWhileStatement(expression_inside: YASLNode, start_index: number, end_index: number): WhileStatement {
        return {
            expression_inside,
            type       : YASLNodeType.WHILE_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getIfStatement(expression_inside: YASLNode, start_index: number, end_index: number): IfStatement {
        return {
            expression_inside,
            next_node  : null,
            type       : YASLNodeType.IF_STATEMENT,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getElseIfStatement(expression_inside: YASLNode, start_index: number, end_index: number): ElseIfStatement {
        return {
            expression_inside,
            next_node  : null,
            type       : YASLNodeType.ELSE_IF_STATEMENT,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getElseStatement(start_index: number, end_index: number): ElseStatement {
        return {
            type       : YASLNodeType.ELSE_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getThenStatement(start_index: number, end_index: number): ThenStatement {
        return {
            type       : YASLNodeType.THEN_STATEMENT,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getSwitchStatement(expression_inside: YASLNode, start_index: number, end_index: number): SwitchStatement {
        return {
            expression_inside,
            next_node  : null,
            type       : YASLNodeType.SWITCH_STATEMENT,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getSwitchCaseStatement(expression_inside: YASLNode, start_index: number, end_index: number): SwitchCaseStatement {
        return {
            expression_inside,
            next_node  : null,
            type       : YASLNodeType.SWITCH_CASE_STATEMENT,
            debug_id   : this.getDebugId(),
            start_index: start_index,
            end_index  : end_index
        };
    }

    getPropertyAccessExpression(parent: YASLLValue, child: IdentifierNode): PropertyAccessNode {
        return {
            parent_node: parent,
            child_node : child,
            type       : YASLNodeType.PROPERTY_ACCESS,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: parent.start_index,
            end_index  : child.start_index
        };
    }

    getPostfixOperation(op_token: YASLToken, left_node: YASLNode): PostfixOperation {
        return {
            operator   : op_token,
            identifier: left_node,
            type       : YASLNodeType.POSTFIX_OPERATION,
            next_node  : null,
            debug_id   : this.getDebugId(),
            start_index: left_node.start_index,
            end_index  : op_token.end
        };
    }

    private getDebugId() {
        return ++this.node_index;
    }
}

export class YASLProgram {

    private curr?: YASLNode | null = null;
    private _root: YASLNode | null = null;

    get root() {
        return this._root;
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
