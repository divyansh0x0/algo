import type {
  YASLToken,
  YASLTokenBinaryOp,
  YASLTokenUnaryOp,
} from "@/lib/core/yasl/YASLToken";
import type { YASLNativeValue } from "~/lib/core/yasl/natives/YASLNativeValue";
import type { Visitor } from "./visitors/Visitor";

export type YASLExpression =
  | UnaryExpression
  | BinaryExpression
  | YASLAssignment
  | LiteralNode
  | CallNode
  | IdentifierNode
  | PropertyAccessNode
  | PostfixOperation
  | IndexingOperation
  | ArrayLiteralNode;
export type YASLLValue =
  | IdentifierNode
  | PropertyAccessNode
  | IndexingOperation;

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

export abstract class YASLNode {
  constructor(
    public type: YASLNodeType,
    public next_node: YASLNode | null,
    public debug_id: number,
    public start_index: number,
    public end_index: number,
  ) {}

  abstract accept<T>(visitor: Visitor<T>): T;
}

export class PostfixOperation extends YASLNode {
  constructor(
    public operator: YASLToken,
    public identifier: YASLNode,
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.OP_POSTFIX, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPostfixOperation(this);
  }
}

export class PropertyAccessNode extends YASLNode {
  constructor(
    public curr_node: YASLExpression,
    public member_node: YASLExpression | undefined,
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(
      YASLNodeType.EXP_PROPERTY_ACCESS,
      null,
      debug_id,
      start_index,
      end_index,
    );
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitPropertyAccessNode(this);
  }
}

export class BinaryExpression extends YASLNode {
  constructor(
    public op: YASLTokenBinaryOp,
    public expression_left: YASLExpression,
    public expression_right: YASLExpression,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.EXP_BINARY, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

export class UnaryExpression extends YASLNode {
  constructor(
    public op: YASLTokenUnaryOp,
    public expression: YASLExpression,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.EXP_UNARY, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}

export class BLockStatement extends YASLNode {
  constructor(debug_id: number, start_index: number, end_index: number) {
    super(YASLNodeType.STMT_BLOCK, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlockStatement(this);
  }
}

export class TernaryExpression extends YASLNode {
  constructor(
    public condition: YASLNode,
    public true_statement: YASLNode,
    public false_statement: YASLNode,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.OP_TERNARY, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitTernaryExpression(this);
  }
}

export class LiteralNode extends YASLNode {
  constructor(
    public value: YASLNativeValue,
    public valueType: YASLValueType,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.EXP_LITERAL, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralNode(this);
  }
}

export class IdentifierNode extends YASLNode {
  constructor(
    public name: string,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.EXP_IDENTIFIER, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIdentifierNode(this);
  }
}

export class ArrayLiteralNode extends YASLNode {
  constructor(
    public elements: YASLExpression[],
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.DEF_ARRAY, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitArrayLiteralNode(this);
  }
}

export class IndexingOperation extends YASLNode {
  constructor(
    public operand: YASLExpression,
    public index: YASLExpression,
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.OP_INDEXING, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIndexingOperation(this);
  }
}

export class CallNode extends YASLNode {
  constructor(
    public qualifiedName: YASLExpression,
    public args: YASLExpression[],
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.EXP_CALL, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCallNode(this);
  }
}

export class BreakStatement extends YASLNode {
  constructor(debug_id: number, start_index: number, end_index: number) {
    super(YASLNodeType.STMT_BREAK, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBreakStatement(this);
  }
}

export class ContinueStatement extends YASLNode {
  constructor(debug_id: number, start_index: number, end_index: number) {
    super(YASLNodeType.STMT_CONTINUE, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitContinueStatement(this);
  }
}

export class ReturnStatement extends YASLNode {
  constructor(debug_id: number, start_index: number, end_index: number) {
    super(YASLNodeType.STMT_RETURN, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReturnStatement(this);
  }
}

export class DeclarationStatement extends YASLNode {
  constructor(
    public lvalue: string,
    public rvalue: YASLExpression | null,
    public types: Set<YASLValueType> | null,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(
      YASLNodeType.STMT_DECLARATION,
      null,
      debug_id,
      start_index,
      end_index,
    );
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitDeclarationStatement(this);
  }
}

export class YASLAssignment extends YASLNode {
  constructor(
    public assignmentOperator: YASLToken,
    public lvalue: YASLExpression,
    public rvalue: YASLExpression,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.EXP_ASSIGN, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitAssignment(this);
  }
}

export class FunctionDefinitionStatement extends YASLNode {
  constructor(
    public identifier_name: string,
    public params: YASLNode[],

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.DEF_FUNCTION, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitFunctionDefinitionStatement(this);
  }
}

export class ForStatement extends YASLNode {
  constructor(
    public statement_1: YASLNode,
    public statement_2: YASLNode,
    public statement_3: YASLNode,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.STMT_FOR, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitForStatement(this);
  }
}

export class WhileStatement extends YASLNode {
  constructor(
    public expression_inside: YASLNode,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.STMT_WHILE, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitWhileStatement(this);
  }
}

export class IfStatement extends YASLNode {
  constructor(
    public expression_inside: YASLNode,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.STMT_IF, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIfStatement(this);
  }
}

export class ElseIfStatement extends YASLNode {
  constructor(
    public expression_inside: YASLNode,

    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.STMT_ELSE_IF, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitElseIfStatement(this);
  }
}

export class ElseStatement extends YASLNode {
  constructor(debug_id: number, start_index: number, end_index: number) {
    super(YASLNodeType.STMT_ELSE, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitElseStatement(this);
  }
}

export class ThenStatement extends YASLNode {
  constructor(debug_id: number, start_index: number, end_index: number) {
    super(YASLNodeType.STMT_THEN, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitThenStatement(this);
  }
}

export class SwitchStatement extends YASLNode {
  constructor(
    public expression_inside: YASLNode,
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.STMT_SWITCH, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSwitchStatement(this);
  }
}

export class SwitchCaseStatement extends YASLNode {
  constructor(
    public expression_inside: YASLNode,
    debug_id: number,
    start_index: number,
    end_index: number,
  ) {
    super(YASLNodeType.STMT_CASE, null, debug_id, start_index, end_index);
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSwitchCaseStatement(this);
  }
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
