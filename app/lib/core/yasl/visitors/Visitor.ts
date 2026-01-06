import {
  DefArrayNode, ExpBinaryNode, StmtBlockNode,
  StmtBreakNode, ExpCallNode,
  StmtContinueNode,
  StmtDeclarationNode,
  StmtElseIfNode,
  StmtElseNode, StmtForNode, DefFunctionNode,
  ExpIdentifierNode, StmtIfNode, OpIndexingNode, ExpLiteralNode, ExpPropertyAccessNode, StmtReturnNode,
  StmtCaseNode,
  StmtSwitchNode, ExpTernaryNode,
  StmtThenNode, ExpUnaryNode, StmtWhileNode, ExpAssignNode, YASLNode, OpPostfixNode
} from "~/lib/core/yasl/YASLNode";

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

  visitStmtBlock(node: StmtBlockNode): T;

  visitStmtBreak(node: StmtBreakNode): T;

  visitStmtCase(node: StmtCaseNode): T;

  visitStmtContinue(node: StmtContinueNode): T;

  visitStmtDeclaration(node: StmtDeclarationNode): T;

  visitStmtElse(node: StmtElseNode): T;

  visitStmtFor(node: StmtForNode): T;

  visitStmtIf(node: StmtIfNode): T;

  visitStmtIfElse(node: StmtElseIfNode): T;

  visitStmtReturn(node: StmtReturnNode): T;

  visitStmtSwitch(node: StmtSwitchNode): T;

  visitStmtThen(node: StmtThenNode): T;

  visitStmtWhile(node: StmtWhileNode): T;
}
