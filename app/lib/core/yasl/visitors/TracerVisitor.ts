import {
    YLexer, YParser, type YExpression,
    YNativeValueWrapper,
    YTypeChecker,
    type YNativeValue,
    YTokenType
} from "../";
import type { LineMap } from "../../LineMap";
import { YEnvironment } from "../environment/environment";
import { YArrayObj } from "../natives/YArrayObj";
import { YTraceList } from "../tracer/YTraceList";
import type { YTracer } from "../tracer/YTracers";
import type { Visitor } from "./Visitor";
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
    StmtElseIfNode,
    StmtElseNode,
    StmtExpressionNode,
    StmtForNode,
    StmtIfNode,
    StmtReturnNode,
    StmtSwitchNode,
    StmtThenNode,
    StmtWhileNode,
    YNode
} from "../YNode";
import { YError } from "./YError";
import { YNull, type YRuntimeValue } from "./YRuntimeValue";

function CreateYaslValue(val: YNativeValue): YRuntimeValue {
    return {kind: "value", value: new YNativeValueWrapper(val)};
}

function CreateYaslRef(ref: YMemPointer): YRuntimeValue {
    return {kind: "ref", ref: ref};
}

function StringifyNativeValues(nativeVals: YNativeValue[]): string {
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

export class TracerVisitor implements Visitor<YRuntimeValue> {
    private next_node: YNode | null = null;
    private rootScope: YEnvironment;
    private currentScope: YEnvironment;
    private tracerList: YTraceList = new YTraceList();
    private ctx = new YRuntimeContext();
    private stdOut = (output:string)=>{
        console.log(output);
    }
    constructor(private readonly map:LineMap) {
        this.rootScope = new YEnvironment();
        this.currentScope = this.rootScope;
    }

    setStdOut(listener:(arg:string) =>void): void {
        this.stdOut = listener;
    }

    private getLine(node:YNode){
        return this.map.getLine(node.startIndex)
    }
    private expectRef(
        node: YNode,
    ): { kind: "ref"; ref: YMemPointer } {
        const rv = node.accept(this);
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
        node: YNode
    ): { kind: "value"; value: YNativeValueWrapper } {
        const rv = node.accept(this);
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
                identifier:objIdentifierNode.name
            }
        );
    }
    private doAssignment(leftNode:YNode, rightNode:YNode) {
        const lvalue = this.expectRef(leftNode);
        const rvalue = this.expectValue(rightNode);
        lvalue.ref.set(rvalue.value);
        return rvalue;
    }

    visitDefArray(node: DefArrayNode): YRuntimeValue {
        const arr: YArrayObj = new YArrayObj();
        for (const element of node.elements) {
            const val = this.expectValue(element).value;
            arr.push(val);
        }
        return {kind: "value", value: new YNativeValueWrapper(arr)};
    }

    visitDefFunction(node: DefFunctionNode): YRuntimeValue {
        return YNull;
    }

    visitExpAssign(node: ExpAssignNode): YRuntimeValue {
        return this.doAssignment(node.lvalue,node.rvalue);
    }

    visitExpBinary(node: ExpBinaryNode): YRuntimeValue {
        // For inline assign operations
        if (node.op === YTokenType.INLINE_ASSIGN) {
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
        throw new YError("Invalid binary operation");
    }

    visitExpCall(node: ExpCallNode): YRuntimeValue {
        if (YTypeChecker.isIdentifier(node.qualifiedName)) {
            switch (node.qualifiedName.name) {
                case "print": {
                    const runtimeVals = node.args.map((arg) => arg.accept(this));
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
            const obj = node.qualifiedName.objectNode;
            const prop = node.qualifiedName.propertyNode;
            if (!prop)
                throw new YError("Invalid state achieved. Prop was undefined of obj");

            if (YTypeChecker.isIdentifier(obj) && YTypeChecker.isIdentifier(prop)) {
                const objRef = this.expectRef(obj);
                const nativeVal = objRef.ref.get();
                if (!nativeVal.isArray())
                    throw new YError("Object methods not implemented");
                else
                    this.callArrayMethod(obj, nativeVal.value, prop, node.args);
            }
        }
        return node.qualifiedName.accept(this);
    }

    visitExpLiteral(node: ExpLiteralNode): YRuntimeValue {
        return {kind: "value", value: node.value};
    }

    visitExpPropertyAccess(node: ExpPropertyAccessNode): YRuntimeValue {
        return YNull;
    }

    visitExpTernary(node: ExpTernaryNode): YRuntimeValue {
        return YNull;

    }

    visitExpUnary(node: ExpUnaryNode): YRuntimeValue {
        return YNull;

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

    visitOpIndexing(node: OpIndexingNode): YRuntimeValue {
        return YNull;
    }

    visitOpPostfix(node: OpPostfixNode): YRuntimeValue {
        return YNull;
    }
    visitStmtAssign(node: StmtAssignNode): YRuntimeValue {
        this.doAssignment(node.lvalue,node.rvalue);
        return YNull;
    }
    expBlockNode(node: ExpBlockNode): YRuntimeValue {
        for (let i = 0; i < node.statements.length; i++){
            const statement = node.statements[i];
            if(i === node.statements.length - 1){ // Last statement
                return statement?.accept(this) ?? YNull;
            }
            else{
                statement?.accept(this);
            }
        }
        return YNull;
    }

    visitStmtBreak(node: StmtBreakNode): YRuntimeValue {
        return YNull;
    }

    visitStmtCase(node: StmtCaseNode): YRuntimeValue {
        return YNull;
    }

    visitStmtContinue(node: StmtContinueNode): YRuntimeValue {
        return YNull;
    }

    visitStmtDeclaration(node: StmtDeclarationNode): YRuntimeValue {
        const lvalue = node.lvalue;
        if (!node.rvalue) {
            this.currentScope.define(lvalue, YNativeValueWrapper.NULL);
            this.tracerList.emitDeclareVariable(lvalue, this.getLine(node), YNativeValueWrapper.NULL );
            return YNull;
        }
        const rvalue = this.expectValue(node.rvalue);
        this.currentScope.define(lvalue, rvalue.value);
        this.tracerList.emitDeclareVariable(lvalue, this.getLine(node), rvalue.value );
        return rvalue;
    }

    visitStmtExpression(node: StmtExpressionNode): YRuntimeValue {
        return node.exp.accept(this);
    }

    visitStmtElse(node: StmtElseNode): YRuntimeValue {
        return YNull;
    }

    visitStmtFor(node: StmtForNode): YRuntimeValue {
        return YNull;
    }

    visitStmtIf(node: StmtIfNode): YRuntimeValue {
        return YNull;
    }

    visitStmtIfElse(node: StmtElseIfNode): YRuntimeValue {
        return YNull;
    }

    visitStmtReturn(node: StmtReturnNode): YRuntimeValue {
        return YNull;
    }

    visitStmtSwitch(node: StmtSwitchNode): YRuntimeValue {
        return YNull;
    }

    visitStmtThen(node: StmtThenNode): YRuntimeValue {
        return YNull;
    }

    visitStmtWhile(node: StmtWhileNode): YRuntimeValue {
        return YNull;
    }


    //**
    //Utility
    getTracers() {
        return this.tracerList
    }

    addTraceListener(param: (trace:YTracer) => void): void {
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
// const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
// const visitor = new TracerVisitor(lexer.getLineMap());
// visitor.addTraceListener((trace)=>{
//     console.log("GOT TRACER",trace)
// })
// const statements = parser.getProgram().getStatements();
// if (statements) {
//     // console.log(YFormatter.formatAst(ast));
//     for (const statement of statements) {
//         statement.accept(visitor);
//     }
// } else {
//     console.error("Couldnt build ast");
// }
