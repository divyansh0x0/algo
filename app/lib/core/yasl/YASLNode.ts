import type { YASLNativeValue } from "./natives/YASLNativeValue";
import type { Visitor } from "./visitors/Visitor";
import { type YASLExpression, YASLNodeType, type YASLStatement, type YASLValueType } from "./YASLAst";
import type { YASLToken, YASLTokenBinaryOp, YASLTokenUnaryOp } from "./YASLToken";

export abstract class YASLNode {
    constructor(
        public type: YASLNodeType,
        public debugId: number,
        public startIndex: number,
        public endIndex: number,
    ) {
    }

    abstract accept<T>(visitor: Visitor<T>): T;
}

export class OpPostfixNode extends YASLNode {
    constructor(
        public operator: YASLToken,
        public identifier: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.OP_POSTFIX, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitOpPostfix(this);
    }
}

export class ExpPropertyAccessNode extends YASLNode {
    constructor(
        public objectNode: YASLExpression,
        public propertyNode: YASLExpression | undefined,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YASLNodeType.EXP_PROPERTY_ACCESS,

            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpPropertyAccess(this);
    }
}

export class ExpBinaryNode extends YASLNode {
    constructor(
        public op: YASLTokenBinaryOp,
        public expLeft: YASLExpression,
        public expRight: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_BINARY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpBinary(this);
    }
}

export class ExpUnaryNode extends YASLNode {
    constructor(
        public op: YASLTokenUnaryOp,
        public expression: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_UNARY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpUnary(this);
    }
}

export class ExpBlockNode extends YASLNode {
    constructor(public statements:YASLStatement[], debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_BLOCK, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.expBlockNode(this);
    }
}

export class ExpTernaryNode extends YASLNode {
    constructor(
        public condition: YASLNode,
        public true_statement: YASLNode,
        public false_statement: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.OP_TERNARY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpTernary(this);
    }
}

export class ExpLiteralNode extends YASLNode {
    constructor(
        public value: YASLNativeValue,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_LITERAL, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpLiteral(this);
    }
}

export class ExpIdentifierNode extends YASLNode {
    constructor(
        public name: string,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_IDENTIFIER, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpIdentifier(this);
    }
}

export class DefArrayNode extends YASLNode {
    constructor(
        public elements: YASLExpression[],
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.DEF_ARRAY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitDefArray(this);
    }
}

export class OpIndexingNode extends YASLNode {
    constructor(
        public operand: YASLExpression,
        public index: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.OP_INDEXING, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitOpIndexing(this);
    }
}

export class ExpCallNode extends YASLNode {
    constructor(
        public qualifiedName: YASLExpression,
        public args: YASLExpression[],
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_CALL, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpCall(this);
    }
}

export class StmtBreakNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_BREAK, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtBreak(this);
    }
}

export class StmtContinueNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_CONTINUE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtContinue(this);
    }
}

export class StmtReturnNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_RETURN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtReturn(this);
    }
}

export class StmtDeclarationNode extends YASLNode {
    constructor(
        public lvalue: string,
        public rvalue: YASLExpression | null,
        public types: Set<YASLValueType> | null,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YASLNodeType.STMT_DECLARATION,

            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtDeclaration(this);
    }
}
export class StmtExpressionNode extends YASLNode {
    constructor(
        public exp: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YASLNodeType.STMT_EXPRESSION,

            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtExpression(this);
    }
}
export class ExpAssignNode extends YASLNode {
    constructor(
        public lvalue: YASLExpression,
        public rvalue: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_ASSIGN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpAssign(this);
    }
}
export class StmtAssignNode extends YASLNode {
    constructor(
        public lvalue: YASLExpression,
        public rvalue: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_ASSIGN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtAssign(this);
    }
}
export class DefFunctionNode extends YASLNode {
    constructor(
        public identifier_name: string,
        public params: YASLNode[],
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.DEF_FUNCTION, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitDefFunction(this);
    }
}

export class StmtForNode extends YASLNode {
    constructor(
        public statement_1: YASLNode,
        public statement_2: YASLNode,
        public statement_3: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_FOR, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtFor(this);
    }
}

export class StmtWhileNode extends YASLNode {
    constructor(
        public expression_inside: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_WHILE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtWhile(this);
    }
}

export class StmtIfNode extends YASLNode {
    constructor(
        public expression_inside: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_IF, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtIf(this);
    }
}

export class StmtElseIfNode extends YASLNode {
    constructor(
        public expression_inside: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_ELSE_IF, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtIfElse(this);
    }
}

export class StmtElseNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_ELSE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtElse(this);
    }
}

export class StmtThenNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_THEN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtThen(this);
    }
}

export class StmtSwitchNode extends YASLNode {
    constructor(
        public expression_inside: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_SWITCH, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtSwitch(this);
    }
}

export class StmtCaseNode extends YASLNode {
    constructor(
        public expression_inside: YASLNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.STMT_CASE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtCase(this);
    }
}