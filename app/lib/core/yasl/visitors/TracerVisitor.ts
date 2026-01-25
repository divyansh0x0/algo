import {
    Lexer, Parser, type YASLExpression,
    YASLNativeValueWrapper,
    YASLNodeTypeChecker,
    type YASLNativeValue,
    YASLTokenType
} from "../";
import type { LineMap } from "../../LineMap";
import { YASLEnvironment } from "../environment/environment";
import { YASLArrayObj } from "../natives/YASLArrayObj";
import { TraceList } from "../tracer/TraceList";
import type { YASLTracer } from "../tracer/Tracers";
import type { Visitor } from "./Visitor";
import type { YASLMemPointer } from "../environment/YASLMemPointer";
import { YASLArrayNativeMethods } from "../natives/methods/YASLArrayNativeMethods";
import { YASLRuntimeContext } from "../tracer/YASLRuntimeError";
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
    StmtElseIfNode,
    StmtElseNode,
    StmtExpressionNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    YASLNode
} from "../YASLNode";
import { YASLError } from "./YASLError";
import { YASLNull, type YASLRuntimeValue } from "./YASLRuntimeValue";

function CreateYaslValue(val: YASLNativeValue): YASLRuntimeValue {
    return {kind: "value", value: new YASLNativeValueWrapper(val)};
}

function CreateYaslRef(ref: YASLMemPointer): YASLRuntimeValue {
    return {kind: "ref", ref: ref};
}

function StringifyNativeValues(nativeVals: YASLNativeValue[]): string {
    let str = ""

    for (let i = 0; i < nativeVals.length; i++){
        const nativeVal = nativeVals[i];
        if(nativeVal === null){
            str += "null";
            continue;
        }
        switch (typeof nativeVal){
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
                str += "[unknown]"
                break;
        }
        if(i < nativeVals.length - 1){
            str += " "
        }
    }
    return str;
}

export class TracerVisitor implements Visitor<YASLRuntimeValue> {
    private next_node: YASLNode | null = null;
    private rootScope: YASLEnvironment;
    private currentScope: YASLEnvironment;
    private tracerList: TraceList = new TraceList();
    private ctx = new YASLRuntimeContext();
    private stdOut = (output:string)=>{
        console.log(output);
    }
    constructor(private readonly map:LineMap) {
        this.rootScope = new YASLEnvironment();
        this.currentScope = this.rootScope;
    }

    setStdOut(listener:(arg:string) =>void): void {
        this.stdOut = listener;
    }

    private getLine(node:YASLNode){
        return this.map.getLine(node.startIndex)
    }
    private expectRef(
        node: YASLNode,
    ): { kind: "ref"; ref: YASLMemPointer } {
        const rv = node.accept(this);
        if (rv.kind !== "ref") {
            this.ctx.raise({
                node,
                kind: "ReferenceError",
                message: "Expected reference but got a value"
            });
            throw new YASLError("TypeError");
        }
        return rv;
    }

    private expectValue(
        node: YASLNode
    ): { kind: "value"; value: YASLNativeValueWrapper } {
        const rv = node.accept(this);
        if (rv.kind !== "value") {
            this.ctx.raise({
                node,
                kind: "TypeError",
                message: "Expected value but got a reference",
            });
            throw new YASLError("TypeError");
        }
        return rv;
    }

    private callArrayMethod(
        objIdentifierNode: ExpIdentifierNode,
        arrayValue: YASLArrayObj,
        methodIdentifierNode: ExpIdentifierNode,
        args: YASLExpression[],
    ): void {
        const methodName = methodIdentifierNode.name;

        const valueArgs = args.map(arg => this.expectValue(arg).value);

        YASLArrayNativeMethods.call(
            methodName,
            arrayValue,
            valueArgs,
            {
                tracer: this.tracerList,
                line: this.getLine(methodIdentifierNode),
                identifier:objIdentifierNode.name
            }
        );
    }
    private doAssignment(leftNode:YASLNode, rightNode:YASLNode) {
        const lvalue = this.expectRef(leftNode);
        const rvalue = this.expectValue(rightNode);
        lvalue.ref.set(rvalue.value);
        return rvalue;
    }

    visitDefArray(node: DefArrayNode): YASLRuntimeValue {
        const arr: YASLArrayObj = new YASLArrayObj();
        for (const element of node.elements) {
            const val = this.expectValue(element).value;
            arr.push(val);
        }
        return {kind: "value", value: new YASLNativeValueWrapper(arr)};
    }

    visitDefFunction(node: DefFunctionNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitExpAssign(node: ExpAssignNode): YASLRuntimeValue {
        return this.doAssignment(node.lvalue,node.rvalue);
    }

    visitExpBinary(node: ExpBinaryNode): YASLRuntimeValue {
        // For inline assign operations
        if (node.op === YASLTokenType.INLINE_ASSIGN) {
            const operand1 = this.expectRef(node.expLeft).ref;
            const operand2 = this.expectValue(node.expRight).value;
            operand1.set(operand2);
            return CreateYaslValue(operand2.value);
        }

        // For normal binary operations
        const expLeft = node.expLeft.accept(this);
        const expRight = node.expRight.accept(this);
        const operand1 = expLeft.kind == "ref" ? expLeft.ref.get() : expLeft.value;
        const operand2 = expRight.kind == "ref" ? expRight.ref.get() : expRight.value;
        switch (node.op) {
            case YASLTokenType.PLUS: {
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
            case YASLTokenType.MINUS:
                // Number subtraction
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value - operand2.value);
                }
                break;
            case YASLTokenType.MULTIPLY:
                // Number multiplication
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value * operand2.value);
                }

                // String duplication
                if (operand1.isString() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value.repeat(operand2.value));
                }
                break;
            case YASLTokenType.DIVIDE:
                // Number division
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value / operand2.value);
                }
                break;
            case YASLTokenType.MODULO:
                // Number remainder
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value % operand2.value);
                }
                break;
            case YASLTokenType.BIT_AND:
                // BITWISE AND
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value & operand2.value);
                }
                break;
            case YASLTokenType.BIT_OR:
                // BITWISE OR
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value | operand2.value);
                }
                break;
            case YASLTokenType.BIT_XOR:
                // BITWISE XOR
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value ^ operand2.value);
                }
                break;
            case YASLTokenType.BIT_SHIFT_LEFT:
                // BITSHIFT LEFT
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value << operand2.value);
                }
                break;
            case YASLTokenType.BIT_SHIFT_RIGHT:
                // BITSHIFT RIGHT
                if (operand1.isNumber() && operand2.isNumber()) {
                    return CreateYaslValue(operand1.value << operand2.value);
                }

                break;
            case YASLTokenType.AND:
                // Logical AND
                if (operand1.isBoolean() && operand2.isBoolean()) {
                    return CreateYaslValue(operand1.value && operand2.value);
                }
                break;
            case YASLTokenType.OR:
                // Logical AND
                if (operand1.isBoolean() || operand2.isBoolean()) {
                    return CreateYaslValue(operand1.value && operand2.value);
                }
                break;
            default:
                this.ctx.raise({
                    node,
                    message: "Invalid operator",
                    kind: "RuntimeError"
                });
        }
        throw new YASLError("Invalid binary operation");
    }

    visitExpCall(node: ExpCallNode): YASLRuntimeValue {
        if (YASLNodeTypeChecker.isIdentifier(node.qualifiedName)) {
            switch (node.qualifiedName.name) {
                case "print": {
                    const runtimeVals = node.args.map((arg) => arg.accept(this));
                    const nativeVals: YASLNativeValue[] = [];
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
        if (YASLNodeTypeChecker.isPropertyAccess(node.qualifiedName)) {
            const obj = node.qualifiedName.objectNode;
            const prop = node.qualifiedName.propertyNode;
            if (!prop)
                throw new YASLError("Invalid state achieved. Prop was undefined of obj");

            if (YASLNodeTypeChecker.isIdentifier(obj) && YASLNodeTypeChecker.isIdentifier(prop)) {
                const objRef = this.expectRef(obj);
                const nativeVal = objRef.ref.get();
                if (!nativeVal.isArray())
                    throw new YASLError("Object methods not implemented");
                else
                    this.callArrayMethod(obj, nativeVal.value, prop, node.args);
            }
        }
        return node.qualifiedName.accept(this);
    }

    visitExpLiteral(node: ExpLiteralNode): YASLRuntimeValue {
        return {kind: "value", value: node.value};
    }

    visitExpPropertyAccess(node: ExpPropertyAccessNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitExpTernary(node: ExpTernaryNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitExpUnary(node: ExpUnaryNode): YASLRuntimeValue {
        return YASLNull;

    }

    visitExpIdentifier(node: ExpIdentifierNode): YASLRuntimeValue {
        let currScope: YASLEnvironment | undefined = this.currentScope;
        let ref: YASLMemPointer | undefined;
        while (!ref && currScope) {
            ref = currScope.get(node.name);
            currScope = this.currentScope.parent;
        }
        return ref ? CreateYaslRef(ref) : YASLNull;

    }

    visitOpIndexing(node: OpIndexingNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitOpPostfix(node: OpPostfixNode): YASLRuntimeValue {
        return YASLNull;
    }
    visitStmtAssign(node: StmtAssignNode): YASLRuntimeValue {
        this.doAssignment(node.lvalue,node.rvalue);
        return YASLNull;
    }
    expBlockNode(node: ExpBlockNode): YASLRuntimeValue {
        for (let i = 0; i < node.statements.length; i++){
            const statement = node.statements[i];
            if(i === node.statements.length - 1){ // Last statement
                return statement?.accept(this) ?? YASLNull;
            }
            else{
                statement?.accept(this);
            }
        }
        return YASLNull;
    }

    visitStmtBreak(node: StmtBreakNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtCase(node: StmtCaseNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtContinue(node: StmtContinueNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtDeclaration(node: StmtDeclarationNode): YASLRuntimeValue {
        const lvalue = node.lvalue;
        if (!node.rvalue) {
            this.currentScope.define(lvalue, YASLNativeValueWrapper.NULL);
            this.tracerList.emitDeclareVariable(lvalue, this.getLine(node), YASLNativeValueWrapper.NULL );
            return YASLNull;
        }
        const rvalue = this.expectValue(node.rvalue);
        this.currentScope.define(lvalue, rvalue.value);
        this.tracerList.emitDeclareVariable(lvalue, this.getLine(node), rvalue.value );
        return rvalue;
    }

    visitStmtExpression(node: StmtExpressionNode): YASLRuntimeValue {
        return node.exp.accept(this);
    }

    visitStmtElse(node: StmtElseNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtFor(node: StmtForNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtIf(node: StmtIfNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtIfElse(node: StmtElseIfNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtReturn(node: StmtReturnNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtSwitch(node: StmtSwitchNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtThen(node: StmtThenNode): YASLRuntimeValue {
        return YASLNull;
    }

    visitStmtWhile(node: StmtWhileNode): YASLRuntimeValue {
        return YASLNull;
    }


    //**
    //Utility
    getTracers() {
        return this.tracerList
    }

    addTraceListener(param: (trace:YASLTracer) => void): void {
        this.tracerList.setListener(param);
    }

    getError() {
        return this.ctx.getError();
    }
}

// const code = `
// let a = [1,2,3]
// print(a)
// a.swap(1,2)
// print(a)
// `;
// const lexer = new Lexer(code);
// const parser = new Parser(lexer.getTokens(), lexer.getLineMap());
// const visitor = new TracerVisitor(lexer.getLineMap());
// visitor.addTraceListener((trace)=>{
//     console.log("GOT TRACER",trace)
// })
// const statements = parser.getProgram().getStatements();
// if (statements) {
//     // console.log(formatter.formatAst(ast));
//     for (const statement of statements) {
//         statement.accept(visitor);
//     }
// } else {
//     console.error("Couldnt build ast");
// }
