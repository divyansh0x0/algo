import type { YMemPointer } from "./environment/YMemPointer";
import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
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
    OpPostfixNode, ExpBlockNode, StmtBreakNode, StmtCaseNode,
    StmtContinueNode, StmtDeclarationNode, StmtElseIfNode, StmtElseNode, StmtExpressionNode, StmtIfNode,
} from "./YNode";

export type YExpression =
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
export type YLValue =
    | ExpIdentifierNode
    | ExpPropertyAccessNode
    | OpIndexingNode;

export enum YNodeType {
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

export enum YValueType {
    string,
    number,
    boolean,
    queue,
    set,
    array,
    function_signature,
    unset,
}

export interface YReturnValue {
    value: YNativeValueWrapper | YMemPointer;
}

export type YStatement =
    | StmtExpressionNode
    | ExpBlockNode
    | StmtDeclarationNode
    | StmtBreakNode
    | StmtCaseNode
    | StmtContinueNode
    | StmtElseIfNode
    | StmtIfNode
    | StmtElseNode;

export class YProgram {
    private statements: YStatement[] = [];

    getStatements() {
        return this.statements;
    }

    addStatement(node: YStatement) {
        this.statements.push(node);
    }
}
