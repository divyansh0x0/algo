import type {Visitor} from "~/lib/core/yasl/visitors/Visitor";
import type {YASLNativeValue} from "~/lib/core/yasl/natives/YASLNativeValue";
import type {YASLToken, YASLTokenBinaryOp, YASLTokenUnaryOp} from "~/lib/core/yasl/YASLToken";
import {type YASLValueType, type YASLExpression, YASLNodeType} from "~/lib/core/yasl/YASLAst";

export abstract class YASLNode {
    constructor(
        public type: YASLNodeType,
        public next_node: YASLNode | null,
        public debugId: number,
        public startIndex: number,
        public endIndex: number,
    ) {}

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
        super(YASLNodeType.OP_POSTFIX, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitOpPostfix(this);
    }
}

export class ExpPropertyAccessNode extends YASLNode {
    constructor(
        public curr_node: YASLExpression,
        public member_node: YASLExpression | undefined,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(
            YASLNodeType.EXP_PROPERTY_ACCESS,
            null,
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
        super(YASLNodeType.EXP_BINARY, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.EXP_UNARY, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpUnary(this);
    }
}

export class StmtBlockNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_BLOCK, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtBlock(this);
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
        super(YASLNodeType.OP_TERNARY, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpTernary(this);
    }
}

export class ExpLiteralNode extends YASLNode {
    constructor(
        public value: YASLNativeValue,
        public valueType: YASLValueType,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_LITERAL, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.EXP_IDENTIFIER, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.DEF_ARRAY, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.OP_INDEXING, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.EXP_CALL, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpCall(this);
    }
}

export class StmtBreakNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_BREAK, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtBreak(this);
    }
}

export class StmtContinueNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_CONTINUE, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtContinue(this);
    }
}

export class StmtReturnNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_RETURN, null, debugId, startIndex, endIndex);
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
            null,
            debugId,
            startIndex,
            endIndex,
        );
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtDeclaration(this);
    }
}

export class ExpAssignNode extends YASLNode {
    constructor(
        public assignmentOperator: YASLToken,
        public lvalue: YASLExpression,
        public rvalue: YASLExpression,
        debugId: number,
        startIndex: number,
        endIndex: number,
    ) {
        super(YASLNodeType.EXP_ASSIGN, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpAssign(this);
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
        super(YASLNodeType.DEF_FUNCTION, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.STMT_FOR, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.STMT_WHILE, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.STMT_IF, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.STMT_ELSE_IF, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtIfElse(this);
    }
}

export class StmtElseNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_ELSE, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtElse(this);
    }
}

export class StmtThenNode extends YASLNode {
    constructor(debugId: number, startIndex: number, endIndex: number) {
        super(YASLNodeType.STMT_THEN, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.STMT_SWITCH, null, debugId, startIndex, endIndex);
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
        super(YASLNodeType.STMT_CASE, null, debugId, startIndex, endIndex);
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitStmtCase(this);
    }
}