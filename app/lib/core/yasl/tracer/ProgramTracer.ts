import {EnvironmentReturnCode, YASLEnvironment} from "../environment/environment";
import {
    type ArrayLiteralNode,
    type BinaryExpression,
    type CallNode,
    type DeclarationStatement,
    type IdentifierNode,
    type IndexingOperation,
    type LiteralNode,
    type PropertyAccessNode,
    type UnaryExpression,
    type YASLAssignment,
    type YASLExpression,
    type YASLLValue,
    type YASLNode,
    YASLNodeType,
    YASLValueType
} from "../tree";
import {YASLTokenType as YASLTokenType} from "../YASLToken";
import {TraceList} from "./TraceList";
import {Lexer} from "../lexer";
import type {YASLNativeValue} from "../natives/YASLNativeValue";
import {YASLNodeTypeChecker} from "../YASLNodeTypeChecker";
import {Parser} from "../parser/Parser";
import {formatter} from "../formatter";
import {YASLArrayObj} from "../natives/YASLArrayObj";
import type {YASLMemPointer} from "../environment/YASLMemPointer";
import {YASLArrayValueMemPointer} from "../environment/YASLArrayValueMemPointer";

interface StatementResult {
    line: number,
    result: YASLNativeValue
}

type StatementResultCallback = ((t: StatementResult) => void);

export class ProgramTracer {
    private next_node: YASLNode | null = null;
    private rootScope: YASLEnvironment;
    private currentScope: YASLEnvironment;
    private statement_callback: null | StatementResultCallback = null;
    private line: number = 0;
    private tracerList: TraceList = new TraceList();

    constructor() {
        this.rootScope = new YASLEnvironment();
        this.currentScope = this.rootScope;
    }

    attachStatementCallback(callback: StatementResultCallback | null) {
        this.statement_callback = callback;
    }

    run(root_node: YASLNode) {
        this.line = 0;
        this.next_node = root_node;
        while (!this.isEnd()) {
            const node = this.consumeNode();
            if (!node)
                break;
            this.evalStatement(node);
            this.line++;
        }
    }

    isEnd() {
        return this.next_node === null;
    }

    private evalStatement(node: YASLNode) {
        let result: YASLNativeValue | null = null;
        switch (node.type) {
            case YASLNodeType.DECLARATION_STATEMENT:
                result = this.evalDeclaration(node as DeclarationStatement);
                break;
            case YASLNodeType.ASSIGNMENT:
                result = this.evalAssignment(node as YASLAssignment);
                break;
            case YASLNodeType.CALL:
                result = this.evalFunction(node as CallNode);
                break;
            default:
                if (YASLNodeTypeChecker.isExpression(node))
                    result = this.evalExpression(node);
                else
                    this.error("Invalid statement", node);
        }
        if (this.statement_callback) {
            this.statement_callback({
                result: result,
                line: this.line
            });
        }
    }


    private evalExpression(node: YASLExpression): YASLNativeValue {
        switch (node.type) {
            case YASLNodeType.UNARY_EXPRESSION:
                return this.evalUnaryExpression(node as UnaryExpression);
            case YASLNodeType.BINARY_EXPRESSION:
                return this.evalBinaryExpression(node as BinaryExpression);
            case YASLNodeType.IndexingOperation:
                return this.evalIndexingOperation(node as IndexingOperation);
            case YASLNodeType.ASSIGNMENT:
                return this.evalAssignment(node as YASLAssignment);
            case YASLNodeType.ARRAY:
                return this.evalArray(node as ArrayLiteralNode);
            case YASLNodeType.LITERAL:
                return this.evalLiteral(node as LiteralNode);
            case YASLNodeType.IDENTIFIER:
                return this.evalMemAccessUsingIdentifier(node as IdentifierNode)?.get() ?? null;
            default:
                this.error("Invalid expression", node);
                return null;
        }
    }

    private evalLiteral(node: LiteralNode) {
        switch (node.valueType) {
            case YASLValueType.number:
                return node.value as number;
            case YASLValueType.string:
                return node.value as string;
            case YASLValueType.boolean:
                return node.value as boolean;
            default:
                this.error("Not implemented", node);
        }
        return null;
    }

    private evalAssignment(node: YASLAssignment): YASLNativeValue {
        // const assign_line = this.line;
        const lvalue = this.evalLValue(node.lvalue);
        const rvalue = this.evalExpression(node.rvalue);
        if (lvalue) {
            lvalue.set(rvalue);
            console.log("Assigned ", rvalue, "to", lvalue);
        } else
            this.error("LValue does not exist", node.lvalue);

        return rvalue;
    }

    private evalDeclaration(node: DeclarationStatement) {
        const evalLine = this.line;
        if (node.rvalue) {
            const rvalue = this.evalExpression(node.rvalue);
            this.currentScope.define(node.lvalue, rvalue);
            this.tracerList.emitDeclareVariable(node.lvalue, evalLine, rvalue);
            return rvalue;
        }
        this.currentScope.define(node.lvalue, null);
        this.tracerList.emitDeclareVariable(node.lvalue, evalLine, null);
        return null;
    }

    private evalArray(node: ArrayLiteralNode): YASLNativeValue {
        const values: YASLNativeValue[] = [];
        for (const element of node.elements) {
            values.push(this.evalExpression(element));
        }
        return new YASLArrayObj(values);
    }

    private evalIndexingOperation(node: IndexingOperation): YASLNativeValue {
        const operand = this.evalExpression(node.operand);
        const indexValue = this.evalExpression(node.index);
        if (operand && typeof operand === "object") {
            if (indexValue && typeof indexValue === "number")
                return operand.get(indexValue);
        }

        return null;
    }

    private evalBinaryExpression(node: BinaryExpression) {
        let value = null;
        const right: YASLNativeValue = this.evalExpression(node.expression_right);
        const left: YASLNativeValue = this.evalExpression(node.expression_left);
        switch (node.op) {
            case YASLTokenType.MINUS:
                if (typeof right === "number" && typeof left === "number")
                    value = left - right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            case YASLTokenType.PLUS:
                if (typeof right === "number" && typeof left === "number")
                    value = left + right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            case YASLTokenType.MULTIPLY:
                if (typeof right === "number" && typeof left === "number")
                    value = left * right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            case YASLTokenType.DIVIDE:
                if (typeof right === "number" && typeof left === "number")
                    value = left / right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            case YASLTokenType.MODULO:
                if (typeof right === "number" && typeof left === "number")
                    value = left % right;
                else
                    this.valueError(YASLValueType.number, node);
                break;

            case YASLTokenType.AND:
                if (typeof right === "boolean" && typeof left === "boolean")
                    value = left && right;
                else
                    this.valueError(YASLValueType.number, node);
                break;

            case YASLTokenType.OR:
                if (typeof right === "boolean" && typeof left === "boolean")
                    value = left || right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            default:
                this.error("Invalid unary operator", node);
        }
        return value;
    }

    private evalUnaryExpression(node: UnaryExpression) {
        let value = null;
        const right: YASLNativeValue = this.evalExpression(node.expression);
        switch (node.op) {
            case YASLTokenType.NEGATE:
                if (typeof right === "boolean" || typeof right === "number")
                    value = !right;
                else
                    this.valueError(YASLValueType.boolean, node);

                break;
            case YASLTokenType.MINUS:
                if (typeof right === "number")
                    value = -1 * right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            case YASLTokenType.BIT_NOT:
                if (typeof right === "number")
                    value = ~right;
                else
                    this.valueError(YASLValueType.number, node);
                break;
            default:
                this.error("Invalid unary operator", node);
        }
        return value;
    }

    private getPropertyValue(node: PropertyAccessNode) {
        this.error("Not implemented get property value", node);
    }

    private evalFunction(node: CallNode): YASLNativeValue {
        const callNode = node.callee;
        if (YASLNodeTypeChecker.isIdentifier(callNode)) {

            switch (callNode.name) {
                case "print": {
                    const values = [];
                    for (const arg of node.args) {
                        values.push(this.evalExpression(arg));
                    }
                    console.log(...values);
                }
            }
        }

        return null;
    }

    private consumeNode() {
        const curr_node = this.next_node;
        if (curr_node)
            this.next_node = curr_node?.next_node;
        return curr_node;
    }


    private error(invalidValue: string, exp_node: YASLNode): void {
        throw Error(invalidValue);
    }

    private valueError(required_value_type: YASLValueType, received_node: YASLNode) {
        throw Error(required_value_type);
    }

    private handleEnvironmentReturnCode(code: EnvironmentReturnCode, lvalue: YASLLValue): void {
        switch (code) {
            case EnvironmentReturnCode.AlreadyDefined:
                this.error("Redeclaration of same LValue is not allowed", lvalue);
                break;
            case EnvironmentReturnCode.NotDefined:
                this.error("LValue not defined", lvalue);
                break;
            case EnvironmentReturnCode.Success:
                break;
            default:
                this.error("Unknown error occurred", lvalue);
                break;
        }
    }

    getTraces() {
        return this.tracerList;
    }


    private evalLValue(lvalue: YASLExpression): YASLMemPointer | null {
        switch (lvalue.type) {
            case YASLNodeType.IndexingOperation: {
                const indexOpNode = lvalue as IndexingOperation;
                const operand = this.evalLValue(indexOpNode.operand);
                const index = this.evalExpression(indexOpNode.index);
                if (!operand) {
                    this.error("Indexing operation applied to a non existing variable", indexOpNode.operand);
                    return null;
                }
                if (index && typeof index === "number") {
                    const val = operand.get();
                    if (!val || typeof val !== "object") {
                        this.error("Invalid indexing operation", indexOpNode.operand);
                        return null;
                    }
                    return new YASLArrayValueMemPointer(val, index);
                }
                this.error("Index operator was not a number", indexOpNode.index);
                break;
            }
            case YASLNodeType.IDENTIFIER:
                return this.evalMemAccessUsingIdentifier(lvalue as IdentifierNode);
            case YASLNodeType.PROPERTY_ACCESS: {
                const propertyAccess = lvalue as PropertyAccessNode;
                const ptr = this.evalLValue(propertyAccess.curr_node);
                if (!ptr) {
                    this.error("Object does not exist in memory", propertyAccess.curr_node);
                    return null;
                }
                const property = propertyAccess.property_node;
                console.log(property?.type);
                break;
            }
            default:
                this.error("Invalid expression for lvalue", lvalue);

        }
        return null;
    }

    private evalMemAccessUsingIdentifier(node: IdentifierNode) {
        let val = this.currentScope.get(node.name);
        const lastScope = this.currentScope;
        while (!val && this.currentScope.parent) {
            this.currentScope = this.currentScope.parent;
            val = this.currentScope.get(node.name);
        }
        if (val === undefined) {
            this.error(`Couldn't find value associated with ${node.name}`, node);
            return null;
        }
        this.currentScope = lastScope;

        return val;
    }

    private parseArgs(args: YASLExpression[]) {
        const values: YASLNativeValue[] = [];
        for (const arg of args) {
            values.push(this.evalExpression(arg));
        }
        return values;
    }
}

const code = `
let a = [1,2,3]
print("hello world",3)

a.length();
`;
const lexer = new Lexer(code);
const p = new Parser(lexer.getTokens(), lexer.getLineMap());
// console.log(lexer.getTokens());
const prog = p.getProgram();
for (const error of p.getErrors()) {
    console.log(error);
}
const programTracer = new ProgramTracer();
if (prog.root) {

    // console.log(formatter.formatAst(prog.root));
    programTracer.run(prog.root);
    // console.log(programTracer.getTraces().traces);

} else
    console.error("Welp its fucked");