import {
    type DefArrayNode,
    type DefFunctionNode,
    type ExpAssignNode,
    type ExpBinaryNode,
    type ExpCallNode,
    type ExpIdentifierNode,
    type ExpLiteralNode,
    type ExpPropertyAccessNode,
    type ExpTernaryNode,
    type ExpUnaryNode,
    type OpIndexingNode,
    type OpPostfixNode, StmtAssignNode,
    type ExpBlockNode,
    type StmtBreakNode,
    type StmtCaseNode,
    type StmtContinueNode,
    type StmtDeclarationNode,
    type StmtElseIfNode,
    type StmtElseNode, StmtExpressionNode,
    type StmtForNode,
    type StmtIfNode,
    type StmtReturnNode,
    type StmtSwitchNode,
    type StmtThenNode,
    type StmtWhileNode, YNode
} from "../YNode";

export interface Visitor<T> {
    visitDefArray(node: DefArrayNode): T;

    visitDefFunction(node: DefFunctionNode): T;

    visitExpAssign(node: ExpAssignNode): T;

    visitExpBinary(node: ExpBinaryNode): T;

    visitExpCall(node: ExpCallNode): T;

    visitExpLiteral(node: ExpLiteralNode): T;

    visitExpPropertyAccess(node: ExpPropertyAccessNode): T;

    visitExpTernary(node: ExpTernaryNode): T;

    visitExpUnary(node: ExpUnaryNode): T;

    visitExpIdentifier(node: ExpIdentifierNode): T;

    visitOpIndexing(node: OpIndexingNode): T;

    visitOpPostfix(node: OpPostfixNode): T;

    visitStmtAssign(node: StmtAssignNode):T;
    expBlockNode(node: ExpBlockNode): T;

    visitStmtBreak(node: StmtBreakNode): T;

    visitStmtCase(node: StmtCaseNode): T;

    visitStmtContinue(node: StmtContinueNode): T;

    visitStmtDeclaration(node: StmtDeclarationNode): T;
    visitStmtExpression(node:StmtExpressionNode):T;
    visitStmtElse(node: StmtElseNode): T;

    visitStmtFor(node: StmtForNode): T;

    visitStmtIf(node: StmtIfNode): T;

    visitStmtIfElse(node: StmtElseIfNode): T;

    visitStmtReturn(node: StmtReturnNode): T;

    visitStmtSwitch(node: StmtSwitchNode): T;

    visitStmtThen(node: StmtThenNode): T;

    visitStmtWhile(node: StmtWhileNode): T;
}
