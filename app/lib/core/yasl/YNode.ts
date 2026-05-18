import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
import { type YExpression, YNodeType, type YStatement, type YValueType } from "./YAst";
import type { YToken, YTokenBinaryOp, YTokenUnaryOp } from "./YToken";

// ==========================================
// CORE / BASE INTERFACES
// ==========================================

export interface YNode {
    readonly type: YNodeType;
    debugId: number;
    startIndex: number;
    endIndex: number;
}

// ==========================================
// VARIABLES & SCOPE (DECLARATIONS, IDENTIFIERS)
// ==========================================

export interface StmtDeclarationNode extends YNode {
    readonly type: YNodeType.STMT_DECLARATION;
    lvalue: string;
    rvalue: YExpression | null;
    types: Set<YValueType> | null;
}

export interface StmtAssignNode extends YNode {
    readonly type: YNodeType.STMT_ASSIGN;
    lvalue: YExpression;
    rvalue: YExpression;
}

export interface ExpAssignNode extends YNode {
    readonly type: YNodeType.EXP_ASSIGN;
    lvalue: YExpression;
    rvalue: YExpression;
}

export interface ExpIdentifierNode extends YNode {
    readonly type: YNodeType.EXP_IDENTIFIER;
    name: string;
}

export interface ExpParameterNode extends YNode {
    readonly type: YNodeType.EXP_PARAMETER;
    name: string;
    types: Set<YValueType> | null;
}

// ==========================================
// CONTROL FLOW (BLOCKS, CONDITIONS, LOOPS)
// ==========================================

export interface ExpBlockNode extends YNode {
    readonly type: YNodeType.STMT_BLOCK;
    statements: YStatement[];
}

export interface StmtIfNode extends YNode {
    readonly type: YNodeType.STMT_IF;
    condition: YExpression;
    block: ExpBlockNode;
}

export interface StmtElseIfNode extends YNode {
    readonly type: YNodeType.STMT_ELSE_IF;
    condition: YExpression;
    block: ExpBlockNode;
}

export interface StmtElseNode extends YNode {
    readonly type: YNodeType.STMT_ELSE;
    block: ExpBlockNode;
}

export interface StmtThenNode extends YNode {
    readonly type: YNodeType.STMT_THEN;
    block: ExpBlockNode;
}

export interface StmtWhileNode extends YNode {
    readonly type: YNodeType.STMT_WHILE;
    condition: YExpression;
    block: ExpBlockNode;
}

export interface StmtForNode extends YNode {
    readonly type: YNodeType.STMT_FOR;
    init_statement: YExpression;
    condition: YExpression;
    increment_statement: YExpression;
    block: ExpBlockNode;
}

export interface StmtSwitchNode extends YNode {
    readonly type: YNodeType.STMT_SWITCH;
    condition: YExpression;
    cases: StmtCaseNode[];
    default_stmt: StmtDefaultNode;
}

export interface StmtCaseNode extends YNode {
    readonly type: YNodeType.STMT_CASE;
    condition: YExpression;
    block: ExpBlockNode;
}

export interface StmtDefaultNode extends YNode {
    readonly type: YNodeType.STMT_DEFAULT;
    block: ExpBlockNode;
}

export interface StmtBreakNode extends YNode {
    readonly type: YNodeType.STMT_BREAK;
}

export interface StmtContinueNode extends YNode {
    readonly type: YNodeType.STMT_CONTINUE;
}

export interface StmtReturnNode extends YNode {
    readonly type: YNodeType.STMT_RETURN;
}

// ==========================================
// OPERATIONS (MATH, LOGIC, UNARY, LITERALS)
// ==========================================

export interface ExpBinaryNode extends YNode {
    readonly type: YNodeType.EXP_BINARY;
    op: YTokenBinaryOp;
    expLeft: YExpression;
    expRight: YExpression;
}

export interface ExpUnaryNode extends YNode {
    readonly type: YNodeType.EXP_UNARY;
    op: YTokenUnaryOp;
    expression: YExpression;
}

export interface ExpTernaryNode extends YNode {
    readonly type: YNodeType.OP_TERNARY;
    condition: YExpression;
    true_statement: YExpression;
    false_statement: YExpression;
}

export interface OpPostfixNode extends YNode {
    readonly type: YNodeType.OP_POSTFIX;
    operator: YToken;
    identifier: YNode;
}

export interface ExpLiteralNode extends YNode {
    readonly type: YNodeType.EXP_LITERAL;
    value: YNativeValueWrapper;
}

// ==========================================
// DATA STRUCTURES (ARRAYS, OBJECTS)
// ==========================================

export interface DefArrayNode extends YNode {
    readonly type: YNodeType.DEF_ARRAY;
    elements: YExpression[];
}

export interface OpIndexingNode extends YNode {
    readonly type: YNodeType.OP_INDEXING;
    operand: YExpression;
    index: YExpression;
}

export interface ExpPropertyAccessNode extends YNode {
    readonly type: YNodeType.EXP_PROPERTY_ACCESS;
    objectNode: YExpression;
    propertyNode: YExpression | undefined;
}

// ==========================================
// FUNCTIONS & CALLS
// ==========================================

export interface DefFunctionNode extends YNode {
    readonly type: YNodeType.DEF_FUNCTION;
    identifier_name: string;
    params: ExpParameterNode[];
    block: ExpBlockNode;
}

export interface ExpCallNode extends YNode {
    readonly type: YNodeType.EXP_CALL;
    qualifiedName: YExpression;
    args: YExpression[];
}

// ==========================================
// WRAPPERS
// ==========================================

export interface StmtExpressionNode extends YNode {
    readonly type: YNodeType.STMT_EXPRESSION;
    exp: YExpression;
}

// ==========================================
// AST UNION
// ==========================================

export type YASTNode =
    | OpPostfixNode
    | ExpPropertyAccessNode
    | ExpBinaryNode
    | ExpUnaryNode
    | ExpBlockNode
    | ExpTernaryNode
    | ExpLiteralNode
    | ExpIdentifierNode
    | ExpParameterNode
    | DefArrayNode
    | OpIndexingNode
    | ExpCallNode
    | StmtBreakNode
    | StmtContinueNode
    | StmtReturnNode
    | StmtDeclarationNode
    | StmtExpressionNode
    | ExpAssignNode
    | StmtAssignNode
    | DefFunctionNode
    | StmtForNode
    | StmtWhileNode
    | StmtIfNode
    | StmtElseIfNode
    | StmtElseNode
    | StmtThenNode
    | StmtSwitchNode
    | StmtCaseNode
    | StmtDefaultNode;