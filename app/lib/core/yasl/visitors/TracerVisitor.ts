import type { YASLVisitorReturnValue} from "~/lib/core/yasl/YASLAst";
import type {Visitor} from "~/lib/core/yasl/visitors/Visitor";
import {
    type DefArrayNode, StmtBlockNode,
    type ExpCallNode, type StmtElseIfNode, type StmtElseNode,
    type DefFunctionNode, type ExpIdentifierNode, type OpIndexingNode,
    type ExpLiteralNode, type ExpPropertyAccessNode, type StmtCaseNode, type ExpTernaryNode, type StmtThenNode,
    type ExpAssignNode, type OpPostfixNode
} from "~/lib/core/yasl/YASLNode";
import type {BinaryExpression, BreakStatement, ContinueStatement, UnaryExpression} from "typescript";

class TracerVisitor implements Visitor<YASLVisitorReturnValue>{
    visitDefArray(node: DefArrayNode): YASLVisitorReturnValue {
        return null;
    }

    visitDefFunction(node: DefFunctionNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpAssign(node: ExpAssignNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpBinary(node: BinaryExpression): YASLVisitorReturnValue {
        return null;
    }

    visitExpCall(node: ExpCallNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpLiteral(node: ExpLiteralNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpPropertyAccess(node: ExpPropertyAccessNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpTernary(node: ExpTernaryNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpUnary(node: UnaryExpression): YASLVisitorReturnValue {
        return null;
    }

    visitExpIdentifier(node: ExpIdentifierNode): YASLVisitorReturnValue {
        return null;
    }

    visitOpIndexing(node: OpIndexingNode): YASLVisitorReturnValue {
        return null;
    }

    visitOpPostfix(node: OpPostfixNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtBlock(node: StmtBlockNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtBreak(node: BreakStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtCase(node: StmtCaseNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtContinue(node: ContinueStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtDeclaration(node: DeclarationStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtElse(node: StmtElseNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtFor(node: ForStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtIf(node: IfStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtIfElse(node: StmtElseIfNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtReturn(node: ReturnStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtSwitch(node: SwitchStatement): YASLVisitorReturnValue {
        return null;
    }

    visitStmtThen(node: StmtThenNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtWhile(node: WhileStatement): YASLVisitorReturnValue {
        return null;
    }

}