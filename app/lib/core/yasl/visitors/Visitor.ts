import type {
  ArrayLiteralNode,
  BinaryExpression,
  BreakStatement,
  CallNode,
  ContinueStatement,
  DeclarationStatement,
  ElseIfStatement,
  ElseStatement,
  ForStatement,
  FunctionDefinitionStatement,
  IdentifierNode,
  IfStatement,
  IndexingOperation,
  LiteralNode,
  PostfixOperation,
  PropertyAccessNode,
  ReturnStatement,
  SwitchCaseStatement,
  SwitchStatement,
  TernaryExpression,
  ThenStatement,
  UnaryExpression,
  WhileStatement,
  YASLAssignment,
} from "../YASLAst";

export interface Visitor<T> {
  visitBinaryExpression(node: BinaryExpression): T;
  visitUnaryExpression(node: UnaryExpression): T;
  visitTernaryExpression(node: TernaryExpression): T;
  visitArrayLiteralNode(node: ArrayLiteralNode): T;
  visitIndexingOperation(node: IndexingOperation): T;
  visitLiteralNode(node: LiteralNode): T;
  visitIdentifierNode(node: IdentifierNode): T;
  visitCallNode(node: CallNode): T;
  visitBreakStatement(node: BreakStatement): T;
  visitBlockStatement(node: BreakStatement): T;
  visitContinueStatement(node: ContinueStatement): T;
  visitReturnStatement(node: ReturnStatement): T;
  visitDeclarationStatement(node: DeclarationStatement): T;
  visitAssignment(node: YASLAssignment): T;
  visitFunctionDefinitionStatement(node: FunctionDefinitionStatement): T;
  visitForStatement(node: ForStatement): T;
  visitWhileStatement(node: WhileStatement): T;
  visitIfStatement(node: IfStatement): T;
  visitElseIfStatement(node: ElseIfStatement): T;
  visitElseStatement(node: ElseStatement): T;
  visitThenStatement(node: ThenStatement): T;
  visitSwitchStatement(node: SwitchStatement): T;
  visitSwitchCaseStatement(node: SwitchCaseStatement): T;
  visitPropertyAccessNode(node: PropertyAccessNode): T;
  visitPostfixOperation(node: PostfixOperation): T;
}
