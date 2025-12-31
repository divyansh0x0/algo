import {YASLEnvironment, EnvironmentReturnCode} from "../environment";
import {
    type BinaryExpression,
    type CallNode,
    type DeclarationStatement,
    type IdentifierNode,
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
import { TraceList } from "./TraceList";
import {Lexer} from "../lexer";
import type {YASLNativeValue} from "../natives/YASLNativeValue";
import {YASLNodeTypeChecker} from "../YASLNodeTypeChecker";
import {Parser} from "../parser/Parser";
import {formatter} from "../formatter";

interface StatementResult {
    line: number,
    result: YASLNativeValue
}

type StatementResultCallback = ((t: StatementResult) => void);

export class ProgramTracer {
    private next_node: YASLNode | null = null;
    private current_scope = new YASLEnvironment();
    private statement_callback: null | StatementResultCallback = null;
    private line: number = 0;
    private tracerList: TraceList = new TraceList();


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
            this.parseStatement(node);
            this.line++;
        }
    }

    isEnd() {
        return this.next_node === null;
    }

    private parseStatement(node: YASLNode) {
        let result: YASLNativeValue | null = null;
        switch (node.type) {
            case YASLNodeType.DECLARATION_STATEMENT:
                result = this.parseDeclaration(node as DeclarationStatement);
                break;
            case YASLNodeType.ASSIGNMENT:
                result = this.parseAssignment(node as YASLAssignment);
                break;
            case YASLNodeType.CALL:
                result = this.parseFunction(node as CallNode);
                break;
            default:
                if (YASLNodeTypeChecker.isExpression(node))
                    result = this.parseExpression(node);
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


    private parseExpression(node: YASLExpression): YASLNativeValue {
        let value: YASLNativeValue = null;
        switch (node.type) {
            case YASLNodeType.UNARY_EXPRESSION:
                value = this.parseUnaryExpression(node as UnaryExpression);
                break;
            case YASLNodeType.BINARY_EXPRESSION:
                value = this.parseBinaryExpression(node as BinaryExpression);
                break;
            case YASLNodeType.ASSIGNMENT:
                value = this.parseAssignment(node as YASLAssignment);
                break;
            case YASLNodeType.LITERAL:
                value = this.parseLiteral(node as LiteralNode);
        }
        if (!value) {
            this.error("Invalid expression", node);
            return null;
        }

        return value;
    }

    private parseLiteral(node: LiteralNode) {
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

    private parseAssignment(node: YASLAssignment): YASLNativeValue {
        const parseLine = this.line;
        const assign_line = this.line;
        const lvalue = node.lvalue;
        const rvalue = this.parseExpression(node.rvalue);
        this.tracerList.emitAssignVariable(node.lvalue.toString(), rvalue, assign_line);
        if (YASLNodeTypeChecker.isIdentifier(lvalue)) {
            this.handleEnvironmentReturnCode(this.current_scope.mutate(lvalue.name, rvalue), lvalue);
        } else if (YASLNodeTypeChecker.isPropertyAccess(lvalue)) {
            this.error("Not implemented", lvalue);
        }
        console.log("Assigned ", rvalue, "to", lvalue);

        this.tracerList.emitAssignVariable(lvalue.toString(),rvalue,parseLine);
        return rvalue;
    }

    private parseDeclaration(node: DeclarationStatement) {
        const parseLine = this.line;
        if (node.rvalue) {
            const rvalue = this.parseExpression(node.rvalue);
            this.current_scope.define(node.lvalue, rvalue);
            this.tracerList.emitDeclareVariable(node.lvalue,parseLine,rvalue);
            return rvalue;
        }
        this.current_scope.define(node.lvalue, null);
        this.tracerList.emitDeclareVariable(node.lvalue,parseLine,null);
        return null;
    }

    private parseBinaryExpression(node: BinaryExpression) {
        let value = null;
        const right: YASLNativeValue = this.parseExpression(node.expression_right);
        const left: YASLNativeValue = this.parseExpression(node.expression_left);
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

    private parseUnaryExpression(node: UnaryExpression) {
        let value = null;
        const right: YASLNativeValue = this.parseExpression(node.expression);
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

    private getIdentifierValue(node: IdentifierNode) {
        this.current_scope.get(node.name);
    }

    private getPropertyValue(node: PropertyAccessNode) {
        this.error("Not implemented get property value", node);
    }

    private parseFunction(node: CallNode) {
        const function_name = node.identifier;
        if (YASLNodeTypeChecker.isIdentifier(function_name)) {

            switch (function_name.name) {
                case "print": {
                    // console.log(node.args)
                    for (const arg of node.args) {
                        console.log(arg);
                    }
                }
            }
        } else {
            this.error("Not implemented", node);
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

    getTraces(){
        return this.tracerList;
    }
}
const lexer = new Lexer("a = [3, b,'hi']");
const p = new Parser(lexer.getTokens(),lexer.getLineMap());
console.log(lexer.getTokens());
const prog=p.getProgram();
// const programTracer = new ProgramTracer();
if(prog.root){

    console.log(formatter.formatAst(prog.root));
    // programTracer.run(prog.root);
    // console.log(programTracer.getTraces().traces);
}
else
    console.error("Welp its fucked")