import type {YASLToken,  YASLTokenBinaryOp,  YASLTokenUnaryOp} from "@/lib/core/yasl/YASLToken";
import type {YASLNativeValue} from "~/lib/core/yasl/natives/YASLNativeValue";

export type YASLExpression =
    UnaryExpression
    | BinaryExpression
    | YASLAssignment
    | LiteralNode
    | CallNode
    | IdentifierNode
    | PropertyAccessNode
    | PostfixOperation | IndexingOperation| ArrayLiteralNode;
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
    POSTFIX_OPERATION = "postfixOperation",
    ARRAY="array",
    IndexingOperation="indexingOperation",
}

export enum YASLValueType {
    string = "string",
    number = "number",
    boolean = "boolean",
    queue = "Queue",
    set = "Set",
    array = "array",
    function_signature = "function",
    unset = "",
}

export interface YASLNode {
    type: YASLNodeType;
    next_node: YASLNode | null;
    debug_id: number;
    start_index: number;
    end_index: number;
}

export interface PostfixOperation extends YASLNode {
    operator: YASLToken;
    identifier: YASLNode;
}

export interface PropertyAccessNode extends YASLNode {
    parent_node: YASLLValue,
    child_node: IdentifierNode,
}

export interface BinaryExpression extends YASLNode {
    op: YASLTokenBinaryOp;
    expression_left: YASLExpression;
    expression_right: YASLExpression;
}

export interface UnaryExpression extends YASLNode {
    op: YASLTokenUnaryOp;
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
    value: YASLNativeValue;
    valueType: YASLValueType;
}

export interface IdentifierNode extends YASLNode {
    name: string;
}
export interface ArrayLiteralNode extends YASLNode{
    type: YASLNodeType.ARRAY;
    elements: YASLExpression[]
}
export interface IndexingOperation extends YASLNode{
    type: YASLNodeType.IndexingOperation;
    operand: YASLExpression;
    index:YASLExpression;
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
