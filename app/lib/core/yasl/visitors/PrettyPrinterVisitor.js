"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrettyPrinterVisitor = void 0;
var YAst_1 = require("../YAst");
function assertNever(node) {
    throw new Error("Unreachable statement " + node.type);
}
var PrettyPrinterVisitor = /** @class */ (function () {
    function PrettyPrinterVisitor() {
        this.indentLevel = 0;
    }
    PrettyPrinterVisitor.prototype.getIndent = function () {
        return "    ".repeat(this.indentLevel);
    };
    PrettyPrinterVisitor.prototype.visit = function (node) {
        switch (node.type) {
            case YAst_1.YNodeType.DEF_ARRAY:
                return this.visitDefArray(node);
            case YAst_1.YNodeType.DEF_FUNCTION:
                return this.visitDefFunction(node);
            case YAst_1.YNodeType.EXP_ASSIGN:
                return this.visitExpAssign(node);
            case YAst_1.YNodeType.EXP_BINARY:
                return this.visitExpBinary(node);
            case YAst_1.YNodeType.EXP_CALL:
                return this.visitExpCall(node);
            case YAst_1.YNodeType.EXP_LITERAL:
                return this.visitExpLiteral(node);
            case YAst_1.YNodeType.EXP_PROPERTY_ACCESS:
                return this.visitExpPropertyAccess(node);
            case YAst_1.YNodeType.OP_TERNARY:
                return this.visitExpTernary(node);
            case YAst_1.YNodeType.EXP_UNARY:
                return this.visitExpUnary(node);
            case YAst_1.YNodeType.EXP_IDENTIFIER:
                return this.visitExpIdentifier(node);
            case YAst_1.YNodeType.EXP_PARAMETER:
                return this.visitExpParameter(node);
            case YAst_1.YNodeType.OP_INDEXING:
                return this.visitOpIndexing(node);
            case YAst_1.YNodeType.OP_POSTFIX:
                return this.visitOpPostfix(node);
            case YAst_1.YNodeType.STMT_ASSIGN:
                return this.visitStmtAssign(node);
            case YAst_1.YNodeType.EXP_BLOCK:
                return this.expBlockNode(node);
            case YAst_1.YNodeType.STMT_BREAK:
                return this.visitStmtBreak(node);
            case YAst_1.YNodeType.STMT_CASE:
                return this.visitStmtCase(node);
            case YAst_1.YNodeType.STMT_DEFAULT:
                return this.visitStmtDefault(node);
            case YAst_1.YNodeType.STMT_CONTINUE:
                return this.visitStmtContinue(node);
            case YAst_1.YNodeType.STMT_DECLARATION:
                return this.visitStmtDeclaration(node);
            case YAst_1.YNodeType.STMT_EXPRESSION:
                return this.visitStmtExpression(node);
            case YAst_1.YNodeType.STMT_ELSE:
                return this.visitStmtElse(node);
            case YAst_1.YNodeType.STMT_FOR:
                return this.visitStmtFor(node);
            case YAst_1.YNodeType.STMT_IF:
                return this.visitStmtIf(node);
            case YAst_1.YNodeType.EXP_IF:
                return this.visitExpIf(node);
            case YAst_1.YNodeType.STMT_RETURN:
                return this.visitStmtReturn(node);
            case YAst_1.YNodeType.STMT_SWITCH:
                return this.visitStmtSwitch(node);
            case YAst_1.YNodeType.STMT_THEN:
                return this.visitStmtThen(node);
            case YAst_1.YNodeType.STMT_WHILE:
                return this.visitStmtWhile(node);
            default:
                return assertNever(node);
        }
    };
    PrettyPrinterVisitor.prototype.visitDefArray = function (node) {
        var _this = this;
        return "[" + node.elements.map(function (e) { return _this.visit(e); }).join(", ") + "]";
    };
    PrettyPrinterVisitor.prototype.visitDefFunction = function (node) {
        var _this = this;
        var paramsStr = node.params.map(function (p) { return _this.visit(p); }).join(", ");
        return "fn " + node.identifier_name + "(" + paramsStr + ") " + this.visit(node.block);
    };
    PrettyPrinterVisitor.prototype.visitExpAssign = function (node) {
        return "(" + this.visit(node.lvalue) + " := " + this.visit(node.rvalue) + ")";
    };
    PrettyPrinterVisitor.prototype.visitExpBinary = function (node) {
        return this.visit(node.expLeft) + " " + node.op + " " + this.visit(node.expRight);
    };
    PrettyPrinterVisitor.prototype.visitExpCall = function (node) {
        var _this = this;
        return this.visit(node.qualifiedName) + "(" + node.args.map(function (a) { return _this.visit(a); }).join(", ") + ")";
    };
    PrettyPrinterVisitor.prototype.visitExpLiteral = function (node) {
        var raw = node.value.value;
        if (typeof raw === "string") {
            return "\"".concat(raw, "\"");
        }
        if (raw === null) {
            return "null";
        }
        return String(raw);
    };
    PrettyPrinterVisitor.prototype.visitExpPropertyAccess = function (node) {
        return this.visit(node.objectNode) + (node.propertyNode ? "." + this.visit(node.propertyNode) : "");
    };
    PrettyPrinterVisitor.prototype.visitExpTernary = function (node) {
        return this.visit(node.condition) + " ? " + this.visit(node.true_statement) + " : " + this.visit(node.false_statement);
    };
    PrettyPrinterVisitor.prototype.visitExpUnary = function (node) {
        return node.op + this.visit(node.expression);
    };
    PrettyPrinterVisitor.prototype.visitExpIdentifier = function (node) {
        return node.name;
    };
    PrettyPrinterVisitor.prototype.visitExpParameter = function (node) {
        var out = node.name;
        if (node.types && node.types.size > 0) {
            out += ": " + Array.from(node.types).join(" | ");
        }
        return out;
    };
    PrettyPrinterVisitor.prototype.visitOpIndexing = function (node) {
        return this.visit(node.operand) + "[" + this.visit(node.index) + "]";
    };
    PrettyPrinterVisitor.prototype.visitOpPostfix = function (node) {
        return this.visit(node.identifier) + node.operator.lexeme;
    };
    PrettyPrinterVisitor.prototype.visitStmtAssign = function (node) {
        return this.getIndent() + this.visit(node.lvalue) + " = " + this.visit(node.rvalue) + ";\n";
    };
    PrettyPrinterVisitor.prototype.expBlockNode = function (node) {
        var out = "{\n";
        this.indentLevel++;
        for (var _i = 0, _a = node.statements; _i < _a.length; _i++) {
            var stmt = _a[_i];
            out += this.visit(stmt);
        }
        this.indentLevel--;
        out += this.getIndent() + "}";
        return out;
    };
    PrettyPrinterVisitor.prototype.visitStmtBreak = function (node) {
        return this.getIndent() + "break;\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtCase = function (node) {
        var out = this.getIndent() + "case " + this.visit(node.condition) + ":\n";
        this.indentLevel++;
        out += this.visit(node.body);
        this.indentLevel--;
        return out;
    };
    PrettyPrinterVisitor.prototype.visitStmtDefault = function (node) {
        var out = this.getIndent() + "default:\n";
        this.indentLevel++;
        out += this.visit(node.body);
        this.indentLevel--;
        return out;
    };
    PrettyPrinterVisitor.prototype.visitStmtContinue = function (node) {
        return this.getIndent() + "continue;\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtDeclaration = function (node) {
        var out = this.getIndent() + "let " + node.lvalue;
        if (node.types && node.types.size > 0) {
            out += ": " + Array.from(node.types).join(" | ");
        }
        if (node.rvalue) {
            out += " = " + this.visit(node.rvalue);
        }
        out += ";\n";
        return out;
    };
    PrettyPrinterVisitor.prototype.visitStmtExpression = function (node) {
        return this.getIndent() + this.visit(node.exp) + ";\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtFor = function (node) {
        return this.getIndent() + "for (" +
            (node.init_statement ? this.visit(node.init_statement) : "") + "; " +
            (node.condition ? this.visit(node.condition) : "") + "; " +
            (node.increment_statement ? this.visit(node.increment_statement) : "") + ") " +
            this.visit(node.body) + "\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtIf = function (node) {
        return this.getIndent() + "if (" + this.visit(node.condition) + ") " + this.visit(node.body) + "\n";
    };
    PrettyPrinterVisitor.prototype.visitExpIf = function (node) {
        return this.getIndent() + "if (" + this.visit(node.condition) + ") " + this.visit(node.truthyResult) + "\n" + "else" + this.visit(node.falsyResult);
    };
    PrettyPrinterVisitor.prototype.visitStmtElse = function (node) {
        return this.getIndent() + "else " + this.visit(node.body) + "\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtReturn = function (node) {
        return this.getIndent() + "return;\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtSwitch = function (node) {
        var out = this.getIndent() + "switch (" + this.visit(node.condition) + ") {\n";
        this.indentLevel++;
        for (var _i = 0, _a = node.cases; _i < _a.length; _i++) {
            var caseNode = _a[_i];
            out += this.visit(caseNode);
        }
        if (node.default_stmt) {
            out += this.visit(node.default_stmt);
        }
        this.indentLevel--;
        out += this.getIndent() + "}\n";
        return out;
    };
    PrettyPrinterVisitor.prototype.visitStmtThen = function (node) {
        return this.getIndent() + "then " + this.visit(node.body) + "\n";
    };
    PrettyPrinterVisitor.prototype.visitStmtWhile = function (node) {
        return this.getIndent() + "while (" + this.visit(node.condition) + ") " + this.visit(node.body) + "\n";
    };
    return PrettyPrinterVisitor;
}());
exports.PrettyPrinterVisitor = PrettyPrinterVisitor;
