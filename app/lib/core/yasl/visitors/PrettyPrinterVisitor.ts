import { YNodeType } from "../YAst";
import type {
    DefArrayNode,
    DefFunctionNode,
    ExpAssignNode,
    ExpBinaryNode,
    ExpCallNode,
    ExpLiteralNode,
    ExpPropertyAccessNode,
    ExpTernaryNode,
    ExpUnaryNode,
    ExpIdentifierNode,
    OpIndexingNode,
    OpPostfixNode,
    StmtAssignNode,
    ExpBlockNode,
    StmtBreakNode,
    StmtCaseNode,
    StmtContinueNode,
    StmtDeclarationNode,
    StmtExpressionNode,
    StmtForNode,
    StmtIfNode,
    StmtElseIfNode,
    StmtElseNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    StmtDefaultNode,
    ExpParameterNode,
    YASTNode
} from "../YNode";
import type { Visitor } from "./Visitor";
function assertNever(node: YASTNode): never {
    throw new Error("Unreachable statement " + node.type);
}
export class PrettyPrinterVisitor implements Visitor<string> {
    private indentLevel = 0;

    private getIndent(): string {
        return "    ".repeat(this.indentLevel);
    }

    public visit(node: YASTNode): string {
        switch (node.type) {
            case YNodeType.DEF_ARRAY:
                return this.visitDefArray(node);
            case YNodeType.DEF_FUNCTION:
                return this.visitDefFunction(node);
            case YNodeType.EXP_ASSIGN:
                return this.visitExpAssign(node);
            case YNodeType.EXP_BINARY:
                return this.visitExpBinary(node);
            case YNodeType.EXP_CALL:
                return this.visitExpCall(node);
            case YNodeType.EXP_LITERAL:
                return this.visitExpLiteral(node);
            case YNodeType.EXP_PROPERTY_ACCESS:
                return this.visitExpPropertyAccess(node);
            case YNodeType.OP_TERNARY:
                return this.visitExpTernary(node);
            case YNodeType.EXP_UNARY:
                return this.visitExpUnary(node);
            case YNodeType.EXP_IDENTIFIER:
                return this.visitExpIdentifier(node);
            case YNodeType.EXP_PARAMETER:
                return this.visitExpParameter(node);
            case YNodeType.OP_INDEXING:
                return this.visitOpIndexing(node);
            case YNodeType.OP_POSTFIX:
                return this.visitOpPostfix(node);
            case YNodeType.STMT_ASSIGN:
                return this.visitStmtAssign(node);
            case YNodeType.EXP_BLOCK:
                return this.expBlockNode(node);
            case YNodeType.STMT_BREAK:
                return this.visitStmtBreak(node);
            case YNodeType.STMT_CASE:
                return this.visitStmtCase(node);
            case YNodeType.STMT_DEFAULT:
                return this.visitStmtDefault(node);
            case YNodeType.STMT_CONTINUE:
                return this.visitStmtContinue(node);
            case YNodeType.STMT_DECLARATION:
                return this.visitStmtDeclaration(node);
            case YNodeType.STMT_EXPRESSION:
                return this.visitStmtExpression(node);
            case YNodeType.STMT_ELSE:
                return this.visitStmtElse(node);
            case YNodeType.STMT_FOR:
                return this.visitStmtFor(node);
            case YNodeType.STMT_IF:
                return this.visitStmtIf(node);
            case YNodeType.STMT_ELSE_IF:
                return this.visitStmtIfElse(node);
            case YNodeType.STMT_RETURN:
                return this.visitStmtReturn(node);
            case YNodeType.STMT_SWITCH:
                return this.visitStmtSwitch(node);
            case YNodeType.STMT_THEN:
                return this.visitStmtThen(node);
            case YNodeType.STMT_WHILE:
                return this.visitStmtWhile(node);
            default:
                return assertNever(node);
        }
    }

    visitDefArray(node: DefArrayNode): string {
        return "[" + node.elements.map(e => this.visit(e)).join(", ") + "]";
    }

    visitDefFunction(node: DefFunctionNode): string {
        const paramsStr = node.params.map(p => this.visit(p)).join(", ");
        return "fn " + node.identifier_name + "(" + paramsStr + ") " + this.visit(node.block);
    }

    visitExpAssign(node: ExpAssignNode): string {
        return "(" + this.visit(node.lvalue) + " := " + this.visit(node.rvalue) + ")";
    }

    visitExpBinary(node: ExpBinaryNode): string {
        return this.visit(node.expLeft) + " " + node.op + " " + this.visit(node.expRight);
    }

    visitExpCall(node: ExpCallNode): string {
        return this.visit(node.qualifiedName) + "(" + node.args.map(a => this.visit(a)).join(", ") + ")";
    }

    visitExpLiteral(node: ExpLiteralNode): string {
        const raw = node.value.value;
        if (typeof raw === "string") {
            return `"${raw}"`;
        }
        if (raw === null) {
            return "null";
        }
        return String(raw);
    }

    visitExpPropertyAccess(node: ExpPropertyAccessNode): string {
        return this.visit(node.objectNode) + (node.propertyNode ? "." + this.visit(node.propertyNode) : "");
    }

    visitExpTernary(node: ExpTernaryNode): string {
        return this.visit(node.condition) + " ? " + this.visit(node.true_statement) + " : " + this.visit(node.false_statement);
    }

    visitExpUnary(node: ExpUnaryNode): string {
        return node.op + this.visit(node.expression);
    }

    visitExpIdentifier(node: ExpIdentifierNode): string {
        return node.name;
    }

    visitExpParameter(node: ExpParameterNode): string {
        let out = node.name;
        if (node.types && node.types.size > 0) {
            out += ": " + Array.from(node.types).join(" | ");
        }
        return out;
    }

    visitOpIndexing(node: OpIndexingNode): string {
        return this.visit(node.operand) + "[" + this.visit(node.index) + "]";
    }

    visitOpPostfix(node: OpPostfixNode): string {
        return this.visit(node.identifier) + node.operator.lexeme;
    }

    visitStmtAssign(node: StmtAssignNode): string {
        return this.getIndent() + this.visit(node.lvalue) + " = " + this.visit(node.rvalue) + ";\n";
    }

    expBlockNode(node: ExpBlockNode): string {
        let out = "{\n";
        this.indentLevel++;
        for (const stmt of node.statements) {
            out += this.visit(stmt);
        }
        this.indentLevel--;
        out += this.getIndent() + "}";
        return out;
    }

    visitStmtBreak(node: StmtBreakNode): string {
        return this.getIndent() + "break;\n";
    }

    visitStmtCase(node: StmtCaseNode): string {
        let out = this.getIndent() + "case " + this.visit(node.condition) + ":\n";
        this.indentLevel++;
        out += this.visit(node.block);
        this.indentLevel--;
        return out;
    }

    visitStmtDefault(node: StmtDefaultNode): string {
        let out = this.getIndent() + "default:\n";
        this.indentLevel++;
        out += this.visit(node.block);
        this.indentLevel--;
        return out;
    }

    visitStmtContinue(node: StmtContinueNode): string {
        return this.getIndent() + "continue;\n";
    }

    visitStmtDeclaration(node: StmtDeclarationNode): string {
        let out = this.getIndent() + "let " + node.lvalue;
        if (node.types && node.types.size > 0) {
            out += ": " + Array.from(node.types).join(" | ");
        }
        if (node.rvalue) {
            out += " = " + this.visit(node.rvalue);
        }
        out += ";\n";
        return out;
    }

    visitStmtExpression(node: StmtExpressionNode): string {
        return this.getIndent() + this.visit(node.exp) + ";\n";
    }

    visitStmtFor(node: StmtForNode): string {
        return this.getIndent() + "for (" +
            (node.init_statement ? this.visit(node.init_statement) : "") + "; " +
            (node.condition ? this.visit(node.condition) : "") + "; " +
            (node.increment_statement ? this.visit(node.increment_statement) : "") + ") " +
            this.visit(node.block) + "\n";
    }

    visitStmtIf(node: StmtIfNode): string {
        return this.getIndent() + "if (" + this.visit(node.condition) + ") " + this.visit(node.block) + "\n";
    }

    visitStmtIfElse(node: StmtElseIfNode): string {
        return this.getIndent() + "else if (" + this.visit(node.condition) + ") " + this.visit(node.block) + "\n";
    }

    visitStmtElse(node: StmtElseNode): string {
        return this.getIndent() + "else " + this.visit(node.block) + "\n";
    }

    visitStmtReturn(node: StmtReturnNode): string {
        return this.getIndent() + "return;\n";
    }

    visitStmtSwitch(node: StmtSwitchNode): string {
        let out = this.getIndent() + "switch (" + this.visit(node.condition) + ") {\n";
        this.indentLevel++;
        for (const caseNode of node.cases) {
            out += this.visit(caseNode);
        }
        if (node.default_stmt) {
            out += this.visit(node.default_stmt);
        }
        this.indentLevel--;
        out += this.getIndent() + "}\n";
        return out;
    }

    visitStmtThen(node: StmtThenNode): string {
        return this.getIndent() + "then " + this.visit(node.block) + "\n";
    }

    visitStmtWhile(node: StmtWhileNode): string {
        return this.getIndent() + "while (" + this.visit(node.condition) + ") " + this.visit(node.block) + "\n";
    }
}
