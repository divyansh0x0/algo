import type { YASLNativeValue } from "~/lib/core/yasl";
import { YASLEnvironment } from "~/lib/core/yasl/environment/environment";
import { YASLArrayObj } from "~/lib/core/yasl/natives/YASLArrayObj";
import { TraceList } from "~/lib/core/yasl/tracer/TraceList";
import type { Visitor } from "~/lib/core/yasl/visitors/Visitor";
import type { YASLVisitorReturnValue } from "~/lib/core/yasl/YASLAst";
import type {
    DefArrayNode,
    DefFunctionNode,
    ExpAssignNode,
    ExpBinaryNode,
    ExpCallNode,
    ExpIdentifierNode,
    ExpLiteralNode,
    ExpPropertyAccessNode,
    ExpTernaryNode,
    ExpUnaryNode,
    OpIndexingNode,
    OpPostfixNode,
    StmtBlockNode,
    StmtBreakNode,
    StmtCaseNode,
    StmtContinueNode,
    StmtDeclarationNode,
    StmtElseIfNode,
    StmtElseNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    YASLNode
} from "../YASLNode";

export class TracerVisitor implements Visitor<YASLVisitorReturnValue> {
    private next_node: YASLNode | null = null;
    private rootScope: YASLEnvironment;
    private currentScope: YASLEnvironment;
    private statement_callback: null | StatementResultCallback = null;
    private line: number = 0;
    private tracerList: TraceList = new TraceList();


    visitDefArray(node: DefArrayNode): YASLVisitorReturnValue {
        const values: YASLNativeValue[] = [];
        for (const element of node.elements) {
            const val = element.accept(this);
            if ()
                values.push(val);
        }
        return new YASLArrayObj(values);
    }

    visitDefFunction(node: DefFunctionNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpAssign(node: ExpAssignNode): YASLVisitorReturnValue {
        return null;
    }

    visitExpBinary(node: ExpBinaryNode): YASLVisitorReturnValue {
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

    visitExpUnary(node: ExpUnaryNode): YASLVisitorReturnValue {
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

    visitStmtBreak(node: StmtBreakNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtCase(node: StmtCaseNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtContinue(node: StmtContinueNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtDeclaration(node: StmtDeclarationNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtElse(node: StmtElseNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtFor(node: StmtForNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtIf(node: StmtIfNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtIfElse(node: StmtElseIfNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtReturn(node: StmtReturnNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtSwitch(node: StmtSwitchNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtThen(node: StmtThenNode): YASLVisitorReturnValue {
        return null;
    }

    visitStmtWhile(node: StmtWhileNode): YASLVisitorReturnValue {
        return null;
    }

}