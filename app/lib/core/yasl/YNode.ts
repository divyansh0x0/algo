import type { YNativeValueWrapper } from "./natives/YNativeValueWrapper";
import type { Visitor } from "./visitors/Visitor";
import { type YExpression, YNodeType, type YStatement, type YValueType } from "./YAst";
import type { YToken, YTokenBinaryOp, YTokenUnaryOp } from "./YToken";

export abstract class YNode {
    constructor(
        public type: YNodeType,
        public debugId: number,
        public startIndex: number,
        public endIndex: number,
    ) {
    }

    abstract accept<T>(visitor: Visitor<T>): T;
}

export class OpPostfixNode extends YNode {
    constructor(
        public operator: YToken,
        public identifier: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.OP_POSTFIX, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitOpPostfix(this);
    }
}

export class ExpPropertyAccessNode extends YNode {
    constructor(
        public objectNode: YExpression,
        public propertyNode: YExpression | undefined,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YNodeType.EXP_PROPERTY_ACCESS,

            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpPropertyAccess(this);
    }
}

export class ExpBinaryNode extends YNode {
    constructor(
        public op: YTokenBinaryOp,
        public expLeft: YExpression,
        public expRight: YExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.EXP_BINARY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpBinary(this);
    }
}

export class ExpUnaryNode extends YNode {
    constructor(
        public op: YTokenUnaryOp,
        public expression: YExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.EXP_UNARY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpUnary(this);
    }
}

export class ExpBlockNode extends YNode {
    constructor(public statements:YStatement[], debugId: number, startIndex: number, endIndex: number) {
        super(YNodeType.STMT_BLOCK, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.expBlockNode(this);
    }
}

export class ExpTernaryNode extends YNode {
    constructor(
        public condition: YNode,
        public true_statement: YNode,
        public false_statement: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.OP_TERNARY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpTernary(this);
    }
}

export class ExpLiteralNode extends YNode {
    constructor(
        public value: YNativeValueWrapper,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.EXP_LITERAL, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpLiteral(this);
    }
}

export class ExpIdentifierNode extends YNode {
    constructor(
        public name: string,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.EXP_IDENTIFIER, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpIdentifier(this);
    }
}

export class DefArrayNode extends YNode {
    constructor(
        public elements: YExpression[],
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.DEF_ARRAY, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitDefArray(this);
    }
}

export class OpIndexingNode extends YNode {
    constructor(
        public operand: YExpression,
        public index: YExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.OP_INDEXING, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitOpIndexing(this);
    }
}

export class ExpCallNode extends YNode {
    constructor(
        public qualifiedName: YExpression,
        public args: YExpression[],
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.EXP_CALL, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpCall(this);
    }
}

export class StmtBreakNode extends YNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YNodeType.STMT_BREAK, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtBreak(this);
    }
}

export class StmtContinueNode extends YNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YNodeType.STMT_CONTINUE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtContinue(this);
    }
}

export class StmtReturnNode extends YNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YNodeType.STMT_RETURN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtReturn(this);
    }
}

export class StmtDeclarationNode extends YNode {
    constructor(
        public lvalue: string,
        public rvalue: YExpression | null,
        public types: Set<YValueType> | null,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YNodeType.STMT_DECLARATION,

            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtDeclaration(this);
    }
}
export class StmtExpressionNode extends YNode {
    constructor(
        public exp: YExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YNodeType.STMT_EXPRESSION,

            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtExpression(this);
    }
}
export class ExpAssignNode extends YNode {
    constructor(
        public lvalue: YExpression,
        public rvalue: YExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.EXP_ASSIGN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpAssign(this);
    }
}
export class StmtAssignNode extends YNode {
    constructor(
        public lvalue: YExpression,
        public rvalue: YExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_ASSIGN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtAssign(this);
    }
}
export class DefFunctionNode extends YNode {
    constructor(
        public identifier_name: string,
        public params: YNode[],
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.DEF_FUNCTION, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitDefFunction(this);
    }
}

export class StmtForNode extends YNode {
    constructor(
        public statement_1: YNode,
        public statement_2: YNode,
        public statement_3: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_FOR, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtFor(this);
    }
}

export class StmtWhileNode extends YNode {
    constructor(
        public expression_inside: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_WHILE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtWhile(this);
    }
}

export class StmtIfNode extends YNode {
    constructor(
        public expression_inside: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_IF, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtIf(this);
    }
}

export class StmtElseIfNode extends YNode {
    constructor(
        public expression_inside: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_ELSE_IF, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtIfElse(this);
    }
}

export class StmtElseNode extends YNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YNodeType.STMT_ELSE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtElse(this);
    }
}

export class StmtThenNode extends YNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YNodeType.STMT_THEN, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtThen(this);
    }
}

export class StmtSwitchNode extends YNode {
    constructor(
        public expression_inside: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_SWITCH, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtSwitch(this);
    }
}

export class StmtCaseNode extends YNode {
    constructor(
        public expression_inside: YNode,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YNodeType.STMT_CASE, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtCase(this);
    }
}