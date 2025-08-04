import { Environment, EnvironmentReturnCode } from "@/yasl/environment";
import { TokenType } from "@/yasl/token";
import {
    BinaryExpression,
    CallNode,
    DeclarationStatement,
    IdentifierNode,
    LiteralNode,
    NativeValue,
    PropertyAccessNode,
    UnaryExpression,
    YASLAssignment,
    YASLExpression,
    YASLLValue,
    YASLNode,
    YASLNodeType,
    YASLNodeTypeChecker,
    YASLValue
} from "@/yasl/tree";

interface StatementResult {
    line: number,
    result: NativeValue
}

type StatementResultCallback = ((t: StatementResult) => void);

export class Interpreter {
    private next_node: YASLNode | null = null;
    private current_scope = new Environment();
    private statement_callback: null | StatementResultCallback = null;
    private line: number = 0;

    constructor() {}

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

    parseStatement(node: YASLNode) {
        let result: NativeValue | null = null;
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


    parseExpression(node: YASLExpression): NativeValue {
        let value: NativeValue = null;
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

    parseLiteral(node: LiteralNode) {
        switch (node.valueType) {
            case YASLValue.number:
                return node.value as number;
            case YASLValue.string:
                return node.value as string;
            case YASLValue.boolean:
                return node.value as boolean;
            default:
                this.error("Not implemented", node);
        }
        return null;
    }

    parseAssignment(node: YASLAssignment): NativeValue {
        const lvalue = node.lvalue;
        const rvalue = this.parseExpression(node.rvalue);
        if (YASLNodeTypeChecker.isIdentifier(lvalue)) {
            this.handleEnvironmentReturnCode(this.current_scope.mutate(lvalue.name, rvalue), lvalue);
        } else if (YASLNodeTypeChecker.isPropertyAccess(lvalue)) {
            this.error("Not implemented", lvalue);

            // this.current_scope.defineScope(lvalue.parent_node, rvalue);
        }
        console.log("Assigned ", rvalue, "to", lvalue);

        return rvalue;
    }

    parseDeclaration(node: DeclarationStatement) {
        if (node.rvalue) {
            const rvalue = this.parseExpression(node.rvalue);
            this.current_scope.define(node.lvalue, rvalue);
            return rvalue;
        } else
            this.current_scope.define(node.lvalue, null);
        console.log("Assigned ", node.rvalue, "to", node.lvalue);
        return null;
    }

    parseBinaryExpression(node: BinaryExpression) {
        let value = null;
        const right: NativeValue = this.parseExpression(node.expression_left);
        const left: NativeValue = this.parseExpression(node.expression_right);
        switch (node.op) {
            case TokenType.MINUS:
                if (typeof right === "number" && typeof left === "number")
                    value = left - right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            case TokenType.PLUS:
                if (typeof right === "number" && typeof left === "number")
                    value = left + right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            case TokenType.MULTIPLY:
                if (typeof right === "number" && typeof left === "number")
                    value = left * right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            case TokenType.DIVIDE:
                if (typeof right === "number" && typeof left === "number")
                    value = left / right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            case TokenType.MODULO:
                if (typeof right === "number" && typeof left === "number")
                    value = left % right;
                else
                    this.valueError(YASLValue.number, node);
                break;

            case TokenType.AND:
                if (typeof right === "boolean" && typeof left === "boolean")
                    value = left && right;
                else
                    this.valueError(YASLValue.number, node);
                break;

            case TokenType.OR:
                if (typeof right === "boolean" && typeof left === "boolean")
                    value = left && right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            default:
                this.error("Invalid unary operator", node);
        }
        return value;
    }

    parseUnaryExpression(node: UnaryExpression) {
        let value = null;
        const right: NativeValue = this.parseExpression(node.expression);
        switch (node.op) {
            case TokenType.NEGATE:
                if (typeof right === "boolean" || typeof right === "number")
                    value = !right;
                else
                    this.valueError(YASLValue.boolean, node);

                break;
            case TokenType.MINUS:
                if (typeof right === "number")
                    value = -1 * right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            case TokenType.BIT_NOT:
                if (typeof right === "number")
                    value = ~right;
                else
                    this.valueError(YASLValue.number, node);
                break;
            default:
                this.error("Invalid unary operator", node);
        }
        return value;
    }

    getIdentifierValue(node: IdentifierNode) {
        this.current_scope.get(node.name);
    }

    getPropertyValue(node: PropertyAccessNode) {
        this.error("Not implemented get property value", node);
    }

    parseFunction(node: CallNode) {
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

    consumeNode() {
        const curr_node = this.next_node;
        if (curr_node)
            this.next_node = curr_node?.next_node;
        return curr_node;
    }


    private error(invalidValue: string, exp_node: YASLNode): void {
        throw Error(invalidValue);
    }

    private valueError(required_value_type: YASLValue, received_node: YASLNode) {
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
}
