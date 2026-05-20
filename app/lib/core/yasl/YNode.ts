import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
import type { YExpression, YLValue, YStatement, YValueType, YNodeType } from "./YAst";
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
    readonly type: YNodeType.EXP_BLOCK;
    statements: YStatement[];
}

export interface StmtIfNode extends YNode {
    readonly type: YNodeType.STMT_IF;
    condition: YExpression;
    truthyBody: YStatement;
    falsyBody: YStatement | null;
}

export interface ExpIfNode extends YNode {
    readonly type: YNodeType.EXP_IF;
    condition: YExpression;
    truthyResult: YExpression;
    falsyResult: YExpression;
}

export interface StmtElseNode extends YNode {
    readonly type: YNodeType.STMT_ELSE;
    body: YExpression;
}

export interface StmtThenNode extends YNode {
    readonly type: YNodeType.STMT_THEN;
    body: YExpression;
}

export interface StmtWhileNode extends YNode {
    readonly type: YNodeType.STMT_WHILE;
    condition: YExpression;
    body: YExpression;
}

export interface StmtForNode extends YNode {
    readonly type: YNodeType.STMT_FOR;
    init_statement: StmtExpressionNode | StmtAssignNode | StmtDeclarationNode;
    condition: YExpression;
    increment_statement: StmtExpressionNode | StmtAssignNode;
    body: YExpression;
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
    body: YExpression;
}

export interface StmtDefaultNode extends YNode {
    readonly type: YNodeType.STMT_DEFAULT;
    body: YExpression;
}

export interface StmtBreakNode extends YNode {
    readonly type: YNodeType.STMT_BREAK;
}

export interface StmtContinueNode extends YNode {
    readonly type: YNodeType.STMT_CONTINUE;
}

export interface StmtReturnNode extends YNode {
    readonly type: YNodeType.STMT_RETURN;
    returnValue: YExpression|null;
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
    identifier: YLValue;
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
    | ExpIfNode
    | StmtElseNode
    | StmtThenNode
    | StmtSwitchNode
    | StmtCaseNode
    | StmtDefaultNode;
