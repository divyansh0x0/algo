import type { YASLMemPointer } from "~/lib/core/yasl/environment/YASLMemPointer";
import type { YASLNativeValue } from "~/lib/core/yasl/natives/YASLNativeValue";
import type {
    DefArrayNode,
    ExpAssignNode,
    ExpBinaryNode,
    ExpCallNode,
    ExpIdentifierNode,
    ExpLiteralNode,
    ExpPropertyAccessNode,
    ExpUnaryNode,
    OpIndexingNode,
    OpPostfixNode,
    YASLNode
} from "~/lib/core/yasl/YASLNode";

export type YASLExpression =
    | ExpUnaryNode
    | ExpBinaryNode
    | ExpAssignNode
    | ExpLiteralNode
    | ExpCallNode
    | ExpIdentifierNode
    | ExpPropertyAccessNode
    | OpPostfixNode
    | OpIndexingNode
    | DefArrayNode;
export type YASLLValue =
    | ExpIdentifierNode
    | ExpPropertyAccessNode
    | OpIndexingNode;

export enum YASLNodeType {
    EXP_IDENTIFIER,
    EXP_LITERAL,
    EXP_CALL,
    STMT_BREAK,
    STMT_CONTINUE,
    STMT_DECLARATION,
    EXP_ASSIGN,
    STMT_RETURN,
    STMT_FOR,
    STMT_WHILE,
    STMT_THEN,
    STMT_IF,
    STMT_ELSE,
    STMT_ELSE_IF,
    STMT_SWITCH,
    STMT_CASE,
    EXP_BINARY,
    EXP_UNARY,
    EXP_PROPERTY_ACCESS,
    OP_TERNARY,
    OP_POSTFIX,
    OP_INDEXING,
    STMT_BLOCK,
    DEF_ARRAY,
    DEF_FUNCTION,
}

export enum YASLValueType {
    string,
    number,
    boolean,
    queue,
    set,
    array,
    function_signature,
    unset,
}

export interface YASLReturnValue {
    value: YASLNativeValue | YASLMemPointer;
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
