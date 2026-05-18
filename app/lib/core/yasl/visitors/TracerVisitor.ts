import {
    type YExpression,
    YNativeValueWrapper,
    YTypeChecker,
    type YNativeValue,
    YTokenType,
    YNodeType
} from "../";
import type { LineMap } from "../../LineMap";
import { YEnvironment } from "../environment/environment";
import { YArrayObj } from "../natives/YArrayObj";
import { YTraceList } from "../tracer/YTraceList";
import type { YTracer } from "../tracer/YTracers";
import type { YMemPointer } from "../environment/YMemPointer";
import { YArrayNativeMethods } from "../natives/methods/YArrayNativeMethods";
import { YRuntimeContext } from "../tracer/YRuntimeError";
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
    OpPostfixNode, StmtAssignNode,
    ExpBlockNode,
    StmtBreakNode,
    StmtCaseNode,
    StmtContinueNode,
    StmtDeclarationNode,
    ExpIfNode,
    StmtElseNode,
    StmtExpressionNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    YASTNode,
    ExpParameterNode,
    StmtDefaultNode
} from "../YNode";
import { YError } from "./YError";
import { YNull, type YRuntimeValue } from "./YRuntimeValue";
import type { Visitor } from "./Visitor";

function CreateYaslValue(val: YNativeValue): YRuntimeValue {
    return { kind: "value", value: new YNativeValueWrapper(val) };
}

function CreateYaslRef(ref: YMemPointer): YRuntimeValue {
    return { kind: "ref", ref: ref };
}
function assertNever(node: YASTNode): never {
    throw new Error("Unreachable statement " + node.type);
}
function StringifyNativeValues(nativeVals: YNativeValue[]): string {
    let str = "";

    for (let i = 0; i < nativeVals.length; i++) {
        const nativeVal = nativeVals[i];
        if (nativeVal === null) {
            str += "null";
            continue;
        }
        switch (typeof nativeVal) {
            case "object":
                str += nativeVal.toString();
                break;
            case "function":
            case "symbol":
            case "bigint":
            case "string":
            case "boolean":
            case "number":
                str += nativeVal.toString();
                break;
            default:
                str += "[unknown]";
                break;
        }
        if (i < nativeVals.length - 1) {
            str += " "
        }
    }
    return str;
}

export class TracerVisitor implements Visitor<YRuntimeValue> {
    private next_node: YASTNode | null = null;
    private rootScope: YEnvironment;
    private currentScope: YEnvironment;
    private tracerList: YTraceList = new YTraceList();
    private ctx = new YRuntimeContext();
    private stdOut = (output: string) => {
        console.log(output);
    };

    constructor(private readonly map: LineMap) {
        this.rootScope = new YEnvironment();
        this.currentScope = this.rootScope;
    }
    visitStmtDefault(node: StmtDefaultNode): YRuntimeValue {
        throw new Error("Method not implemented.");
    }
    visitExpParameter(node: ExpParameterNode): YRuntimeValue {
        throw new Error("Method not implemented.");
    }

    // ==========================================
    // CORE TRAVERSAL & DISPATCH
    // ==========================================

    // Exhaustive entry point for AST traversal
    public visit(node: YASTNode): YRuntimeValue {
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
            case YNodeType.EXP_IF:
                return this.visitExpIf(node);
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

    // ==========================================
    // VARIABLES & SCOPE (DECLARATION, ASSIGNMENT, IDENTIFIERS)
    // ==========================================

    visitStmtDeclaration(node: StmtDeclarationNode): YRuntimeValue {
        const lvalue = node.lvalue;
        if (!node.rvalue) {
            this.currentScope.define(lvalue, YNativeValueWrapper.NULL);
            this.tracerList.emitDeclareVariable(lvalue, this.getLine(node), YNativeValueWrapper.NULL);
            return YNull;
        }
        const rvalue = this.expectValue(node.rvalue);
        this.currentScope.define(lvalue, rvalue.value);
        this.tracerList.emitDeclareVariable(lvalue, this.getLine(node), rvalue.value);
        return rvalue;
    }

    visitStmtAssign(node: StmtAssignNode): YRuntimeValue {
        this.doAssignment(node.lvalue, node.rvalue);
        return YNull;
    }

    visitExpAssign(node: ExpAssignNode): YRuntimeValue {
        return this.doAssignment(node.lvalue, node.rvalue);
    }

    visitExpIdentifier(node: ExpIdentifierNode): YRuntimeValue {
        let currScope: YEnvironment | undefined = this.currentScope;
        let ref: YMemPointer | undefined;
        while (!ref && currScope) {
            ref = currScope.get(node.name);
            currScope = this.currentScope.parent;
        }
        return ref ? CreateYaslRef(ref) : YNull;
    }

    // ==========================================
    // CONTROL FLOW (BLOCKS, IF, SWITCH, LOOPS)
    // ==========================================

    expBlockNode(node: ExpBlockNode): YRuntimeValue {
        for (let i = 0; i < node.statements.length; i++) {
            const statement = node.statements[i];
            if (i === node.statements.length - 1) { // Last statement
                return statement ? this.visit(statement) : YNull;
            }
            else {
                if (statement) this.visit(statement);
            }
        }
        return YNull;
    }

    visitStmtIf(node: StmtIfNode): YRuntimeValue {
        return YNull;
    }

    visitExpIf(node: ExpIfNode): YRuntimeValue {
        return YNull;
    }

    visitStmtElse(node: StmtElseNode): YRuntimeValue {
        return YNull;
    }

    visitStmtThen(node: StmtThenNode): YRuntimeValue {
        return YNull;
    }

    visitStmtSwitch(node: StmtSwitchNode): YRuntimeValue {
        return YNull;
    }

    visitStmtCase(node: StmtCaseNode): YRuntimeValue {
        return YNull;
    }

    visitStmtWhile(node: StmtWhileNode): YRuntimeValue {
        return YNull;
    }

    visitStmtFor(node: StmtForNode): YRuntimeValue {
        return YNull;
    }

    visitStmtBreak(node: StmtBreakNode): YRuntimeValue {
        return YNull;
    }

    visitStmtContinue(node: StmtContinueNode): YRuntimeValue {
        return YNull;
    }

    visitStmtReturn(node: StmtReturnNode): YRuntimeValue {
        return YNull;
    }

    visitStmtExpression(node: StmtExpressionNode): YRuntimeValue {
        return this.visit(node.exp);
    }

    // ==========================================
    // OPERATIONS (MATH, LOGIC, UNARY, POSTFIX, LITERALS)
    // ==========================================

    visitExpBinary(node: ExpBinaryNode): YRuntimeValue {
        // For inline assign operations
        if (node.op === YTokenType.INLINE_ASSIGN) {
            const operand1 = this.expectRef(node.expLeft).ref;
            const operand2 = this.expectValue(node.expRight).value;
            operand1.set(operand2);
            return CreateYaslValue(operand2.value);
        }

        // For normal binary operations
        const expLeft = this.visit(node.expLeft);
        const expRight = this.visit(node.expRight);
        const operand1 = expLeft.kind == "ref" ? expLeft.ref.get() : expLeft.value;
        const operand2 = expRight.kind == "ref" ? expRight.ref.get() : expRight.value;
        switch (node.op) {
            case YTokenType.PLUS: {
                // Number addition
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value + operand2.value);
                }
                // String concatenation
                if (operand1.isString() && operand2.isString()) {
                    return CreateYaslValue(operand1.value.concat(operand2.value));
                }
                break;
            }
            case YTokenType.MINUS:
                // Number subtraction
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value - operand2.value);
                }
                break;
            case YTokenType.MULTIPLY:
                // Number multiplication
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value * operand2.value);
                }

                // String duplication
                if (operand1.isString() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value.repeat(operand2.value));
                }
                break;
            case YTokenType.DIVIDE:
                // Number division
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value / operand2.value);
                }
                break;
            case YTokenType.MODULO:
                // Number remainder
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value % operand2.value);
                }
                break;
            case YTokenType.BIT_AND:
                // BITWISE AND
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value & operand2.value);
                }
                break;
            case YTokenType.BIT_OR:
                // BITWISE OR
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value | operand2.value);
                }
                break;
            case YTokenType.BIT_XOR:
                // BITWISE XOR
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value ^ operand2.value);
                }
                break;
            case YTokenType.BIT_SHIFT_LEFT:
                // BITSHIFT LEFT
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value << operand2.value);
                }
                break;
            case YTokenType.BIT_SHIFT_RIGHT:
                // BITSHIFT RIGHT
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value << operand2.value);
                }
                break;
            case YTokenType.AND:
                // Logical AND
                if (operand1.isBoolean() && operand2.isBoolean()) {
                    return CreateYaslValue(operand1.value && operand2.value);
                }
                break;
            case YTokenType.OR:
                // Logical OR
                if (operand1.isBoolean() || operand2.isBoolean()) {
                    return CreateYaslValue(operand1.value || operand2.value);
                }
                break;
            default:
                this.ctx.raise({
                    node,
                    message: "Invalid operator",
                    kind: "RuntimeError"
                });
        }
        throw new YError("Invalid binary operation");
    }

    visitExpUnary(node: ExpUnaryNode): YRuntimeValue {
        return YNull;
    }

    visitExpTernary(node: ExpTernaryNode): YRuntimeValue {
        return YNull;
    }

    visitOpPostfix(node: OpPostfixNode): YRuntimeValue {
        return YNull;
    }

    visitExpLiteral(node: ExpLiteralNode): YRuntimeValue {
        return { kind: "value", value: node.value };
    }

    // ==========================================
    // DATA STRUCTURES (ARRAYS, OBJECTS)
    // ==========================================

    visitDefArray(node: DefArrayNode): YRuntimeValue {
        const arr: YArrayObj = new YArrayObj();
        for (const element of node.elements) {
            const val = this.expectValue(element).value;
            arr.push(val);
        }
        return { kind: "value", value: new YNativeValueWrapper(arr) };
    }

    visitOpIndexing(node: OpIndexingNode): YRuntimeValue {
        return YNull;
    }

    visitExpPropertyAccess(node: ExpPropertyAccessNode): YRuntimeValue {
        return YNull;
    }

    // ==========================================
    // FUNCTIONS & CALLS
    // ==========================================

    visitDefFunction(node: DefFunctionNode): YRuntimeValue {
        return YNull;
    }

    visitExpCall(node: ExpCallNode): YRuntimeValue {
        if (YTypeChecker.isIdentifier(node.qualifiedName)) {
            const qualifiedName = node.qualifiedName as ExpIdentifierNode;
            switch (qualifiedName.name) {
                case "print": {
                    const runtimeVals = node.args.map((arg) => this.visit(arg));
                    const nativeVals: YNativeValue[] = [];
                    for (const runtimeVal of runtimeVals) {
                        if (runtimeVal.kind === "value")
                            nativeVals.push(runtimeVal.value.value);
                        else {
                            const val = runtimeVal.ref.get();
                            nativeVals.push(val.value);
                        }
                    }
                    this.stdOut(StringifyNativeValues(nativeVals));
                }
            }
        }
        if (YTypeChecker.isPropertyAccess(node.qualifiedName)) {
            const qualifiedName = node.qualifiedName as ExpPropertyAccessNode;
            const obj = qualifiedName.objectNode;
            const prop = qualifiedName.propertyNode;
            if (!prop)
                throw new YError("Invalid state achieved. Prop was undefined of obj");

            if (YTypeChecker.isIdentifier(obj) && YTypeChecker.isIdentifier(prop)) {
                const objRef = this.expectRef(obj);
                const nativeVal = objRef.ref.get();
                if (!nativeVal.isArray())
                    throw new YError("Object methods not implemented");
                else
                    this.callArrayMethod(obj as ExpIdentifierNode, nativeVal.value, prop as ExpIdentifierNode, node.args);
            }
        }
        return this.visit(node.qualifiedName);
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    setStdOut(listener: (arg: string) => void): void {
        this.stdOut = listener;
    }

    private getLine(node: YASTNode) {
        return this.map.getLine(node.startIndex)
    }

    private expectRef(
        node: YASTNode,
    ): { kind: "ref"; ref: YMemPointer } {
        const rv = this.visit(node);
        if (rv.kind !== "ref") {
            this.ctx.raise({
                node,
                kind: "ReferenceError",
                message: "Expected reference but got a value"
            });
            throw new YError("TypeError");
        }
        return rv;
    }

    private expectValue(
        node: YASTNode
    ): { kind: "value"; value: YNativeValueWrapper } {
        const rv = this.visit(node);
        if (rv.kind !== "value") {
            this.ctx.raise({
                node,
                kind: "TypeError",
                message: "Expected value but got a reference",
            });
            throw new YError("TypeError");
        }
        return rv;
    }

    private callArrayMethod(
        objIdentifierNode: ExpIdentifierNode,
        arrayValue: YArrayObj,
        methodIdentifierNode: ExpIdentifierNode,
        args: YExpression[],
    ): void {
        const methodName = methodIdentifierNode.name;

        const valueArgs = args.map(arg => this.expectValue(arg).value);

        YArrayNativeMethods.call(
            methodName,
            arrayValue,
            valueArgs,
            {
                tracer: this.tracerList,
                line: this.getLine(methodIdentifierNode),
                identifier: objIdentifierNode.name
            }
        );
    }

    private doAssignment(leftNode: YASTNode, rightNode: YASTNode) {
        const lvalue = this.expectRef(leftNode);
        const rvalue = this.expectValue(rightNode);
        lvalue.ref.set(rvalue.value);
        return rvalue;
    }

    getTracers() {
        return this.tracerList
    }

    addTraceListener(param: (trace: YTracer) => void): void {
        this.tracerList.setListener(param);
    }

    getError() {
        return this.ctx.getError();
    }
}
