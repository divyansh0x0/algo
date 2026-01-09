import type { YASLMemPointer } from "./environment/YASLMemPointer";
import type { YASLNativeValue } from "./natives/YASLNativeValue";
import {
    type DefArrayNode,
    type ExpAssignNode,
    type ExpBinaryNode,
    type ExpCallNode,
    type ExpIdentifierNode,
    type ExpLiteralNode,
    type ExpPropertyAccessNode,
    type ExpUnaryNode,
    type OpIndexingNode,
    type OpPostfixNode, ExpBlockNode, StmtBreakNode, StmtCaseNode,
    StmtContinueNode, StmtDeclarationNode, StmtElseIfNode, StmtElseNode, StmtExpressionNode, StmtIfNode,
    type YASLNode
} from "./YASLNode";

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
    STMT_BLOCK,
    STMT_EXPRESSION,
    EXP_BINARY,
    EXP_UNARY,
    EXP_PROPERTY_ACCESS,
    OP_TERNARY,
    OP_POSTFIX,
    OP_INDEXING,
    DEF_ARRAY,
    DEF_FUNCTION,
    STMT_ASSIGN,
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

export type YASLStatement =
    | StmtExpressionNode
    | ExpBlockNode
    | StmtDeclarationNode
    | StmtBreakNode
    | StmtCaseNode
    | StmtContinueNode
    | StmtElseIfNode
    | StmtIfNode
    | StmtElseNode;

export class YASLProgram {
    private statements: YASLStatement[] = [];

    getStatements() {
        return this.statements;
    }

    addStatement(node: YASLStatement) {
        this.statements.push(node);
    }
}
