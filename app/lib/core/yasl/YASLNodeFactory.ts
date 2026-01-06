import type {
  YASLToken,
  YASLTokenBinaryOp,
  YASLTokenUnaryOp,
} from "./YASLToken";
import type { YASLNativeValue } from "./natives/YASLNativeValue";
import {
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
  type YASLValueType,
  type YASLExpression,
  type YASLNode,
} from "./YASLAst";
export class YASLNodeFactory {
  private node_index = 0;

  getBinaryExpression(
    op: YASLTokenBinaryOp,
    expression_left: YASLExpression,
    expression_right: YASLExpression,
  ): BinaryExpression {
    return new BinaryExpression(
      op,
      expression_left,
      expression_right,
      this.getDebugId(),
      expression_left.start_index,
      expression_right.end_index,
    );
  }

  getUnaryExpression(
    op: YASLTokenUnaryOp,
    expression: YASLExpression,
    start: number,
    end: number,
  ): UnaryExpression {
    return new UnaryExpression(op, expression, this.getDebugId(), start, end);
  }

  getTernaryExpression(
    condition: YASLNode,
    true_statement: YASLNode,
    false_statement: YASLNode,
  ): TernaryExpression {
    return new TernaryExpression(
      condition,
      true_statement,
      false_statement,
      this.getDebugId(),
      condition.start_index,
      condition.end_index,
    );
  }

  getArrayLiteral(elements: YASLExpression[]): ArrayLiteralNode {
    const startIndex = elements[0]?.start_index ?? 0;
    const endIndex = elements[elements.length - 1]?.end_index ?? 0;
    return new ArrayLiteralNode(
      elements,
      this.getDebugId(),
      startIndex,
      endIndex,
    );
  }

  getIndexOperation(
    operand: YASLExpression,
    index: YASLExpression,
  ): IndexingOperation {
    return new IndexingOperation(
      index,
      operand,
      this.getDebugId(),
      operand.start_index,
      operand.end_index,
    );
  }

  getLiteralNode(
    value: YASLNativeValue,
    valueType: YASLValueType,
    start_index: number,
    end_index: number,
  ): LiteralNode {
    return new LiteralNode(
      value,
      valueType,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getIdentifierNode(name: YASLToken): IdentifierNode {
    const name_str = name.lexeme;
    return new IdentifierNode(
      name_str,
      this.getDebugId(),
      name.start,
      name.end,
    );
  }

  getCallNode(callee: YASLExpression, args: YASLExpression[]): CallNode {
    return new CallNode(
      callee,
      args,
      this.getDebugId(),
      callee.start_index,
      callee.end_index,
    );
  }

  getBreakStatement(token: YASLToken): BreakStatement {
    return new BreakStatement(this.getDebugId(), token.start, token.end);
  }

  getContinueStatement(token: YASLToken): ContinueStatement {
    return new ContinueStatement(this.getDebugId(), token.start, token.end);
  }

  getReturnStatement(token: YASLToken): ReturnStatement {
    return new ReturnStatement(this.getDebugId(), token.start, token.end);
  }

  getDeclarationStatement(
    identifier_name: string,
    value: YASLExpression | null,
    types: Set<YASLValueType> | null,
    start_index: number,
    end_index: number,
  ): DeclarationStatement {
    return new DeclarationStatement(
      identifier_name,
      value,
      types,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getAssignmentExpression(
    assignmentOperatorToken: YASLToken,
    lvalue: YASLExpression,
    rvalue: YASLExpression,
  ): YASLAssignment {
    return new YASLAssignment(
      assignmentOperatorToken,
      lvalue,
      rvalue,
      this.getDebugId(),
      lvalue.start_index,
      rvalue.end_index,
    );
  }

  getFunctionDefinition(
    identifier_name: string,
    params: YASLNode[],
    start_index: number,
    end_index: number,
  ): FunctionDefinitionStatement {
    return new FunctionDefinitionStatement(
      identifier_name,
      params,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getForStatement(
    statement_1: YASLNode,
    statement_2: YASLNode,
    statement_3: YASLNode,
    start_index: number,
    end_index: number,
  ): ForStatement {
    return new ForStatement(
      statement_1,
      statement_2,
      statement_3,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getWhileStatement(
    expression_inside: YASLNode,
    start_index: number,
    end_index: number,
  ): WhileStatement {
    return new WhileStatement(
      expression_inside,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getIfStatement(
    expression_inside: YASLNode,
    start_index: number,
    end_index: number,
  ): IfStatement {
    return new IfStatement(
      expression_inside,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getElseIfStatement(
    expression_inside: YASLNode,
    start_index: number,
    end_index: number,
  ): ElseIfStatement {
    return new ElseIfStatement(
      expression_inside,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getElseStatement(start_index: number, end_index: number): ElseStatement {
    return new ElseStatement(this.getDebugId(), start_index, end_index);
  }

  getThenStatement(start_index: number, end_index: number): ThenStatement {
    return new ThenStatement(this.getDebugId(), start_index, end_index);
  }

  getSwitchStatement(
    expression_inside: YASLNode,
    start_index: number,
    end_index: number,
  ): SwitchStatement {
    return new SwitchStatement(
      expression_inside,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getSwitchCaseStatement(
    expression_inside: YASLNode,
    start_index: number,
    end_index: number,
  ): SwitchCaseStatement {
    return new SwitchCaseStatement(
      expression_inside,
      this.getDebugId(),
      start_index,
      end_index,
    );
  }

  getPropertyAccessExpression(
    curr: YASLExpression,
    child?: YASLExpression,
  ): PropertyAccessNode {
    return new PropertyAccessNode(
      curr,
      child,
      this.getDebugId(),
      curr.start_index,
      child ? child.end_index : curr.end_index,
    );
  }

  getPostfixOperation(
    operatorToken: YASLToken,
    operandNode: YASLNode,
  ): PostfixOperation {
    return new PostfixOperation(
      operatorToken,
      operandNode,
      this.getDebugId(),
      operandNode.start_index,
      operatorToken.end,
    );
  }

  private getDebugId() {
    return ++this.node_index;
  }
}
