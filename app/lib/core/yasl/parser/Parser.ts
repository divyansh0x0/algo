import type { LineMap } from "../../LineMap";
import { formatter } from "../formatter";
import { YASLNativeValue } from "../natives/YASLNativeValue";
import { type YASLExpression, YASLProgram,type YASLValueType } from "../YASLAst";
import { YASLNodeFactory } from "../YASLNodeFactory";
import { YASLNodeTypeChecker } from "../YASLNodeTypeChecker";
import { type YASLToken, type YASLTokenBinaryOp, YASLTokenType, type YASLTokenUnaryOp } from "../YASLToken";
import {
    getBindingPower,
    isAssignmentOperator,
    isExpressionTerminator,
    isOperator,
    isPostfixOperator,
    parseTypeToken
} from "./Helpers";
import type { ParserError } from "./ParserError";

export class Parser {
    private next_index = 0;
    private parenthesis_count = 0;

    private program = new YASLProgram();
    private node_factory = new YASLNodeFactory();

    private errors = Array<ParserError>();

    constructor(private tokens: YASLToken[], private line_map: LineMap) {

    }

    getProgram(): YASLProgram {
        while (!this.isEOF()) {
            this.parseStatement();
        }
        return this.program;
    }

    getErrors() {
        return this.errors;
    }

    private parseStatement() {
        const token = this.peek();

        switch (token.type) {
            case YASLTokenType.STATEMENT_END:
                this.consume();
                break;
            case YASLTokenType.LET:
                this.parseDeclaration();
                break;
            case YASLTokenType.IDENTIFIER: {
                const lvalue = this.consumeExpression();
                if (!lvalue) {
                    this.errorToken("Invalid statement", token);
                    break;
                }

                const inlineAssign = this.peek();
                if (inlineAssign.type === YASLTokenType.INLINE_ASSIGN) {
                    this.errorToken("Inline assignment used as normal assignment, use '=' for assignments in a statement");
                    break;
                }
                if (isAssignmentOperator(inlineAssign.type)) {
                    this.consume();
                    const rvalue = this.consumeExpression();
                    if (!rvalue) {
                        this.errorToken("Invalid RValue");
                        break;
                    }
                    this.program.addStatement(this.node_factory.getAssignmentStatement(lvalue, rvalue));
                    break;
                }
                this.program.addStatement(this.node_factory.getStatementExpression(lvalue));
                break;
            }
            default: {
                const exp = this.parseExpression();
                if (exp)
                    this.program.addStatement(this.node_factory.getStatementExpression(exp));
                break;
            }


        }
    }

    private synchronize() {
        while (!this.isEOF()) {
            const next_token = this.peek();
            if (next_token.type !== YASLTokenType.STATEMENT_END)
                this.consume();
            else
                break;
        }
    }

    private errorToken(msg: string, token: YASLToken | null = null) {
        const error_token = token == null ? this.tokens[this.next_index - 1] : token;
        if (error_token != null) {
            const [ line1, col1 ] = this.line_map.indexToLineCol(error_token.start);
            const [ line2, col2 ] = this.line_map.indexToLineCol(error_token.end);
            this.errors.push({
                message: msg,
                token: error_token,
                highlight: "",
                start_col: col1,
                end_col: col2,
                start_line: line1,
                end_line: line2
            });
            throw Error(msg);
        }

        this.synchronize();
    }

    private consume(): YASLToken {
        console.assert(this.next_index < this.tokens.length, "For some reason index of next token exceeded token stream length");
        const token = this.tokens[this.next_index];
        if (this.next_index < this.tokens.length)
            this.next_index++;
        return token!;
    }

    /**
     * consumes the token if it matches token type and returns true otherwise false
     */
    private match(token_type: YASLTokenType): boolean {
        return this.peek().type === token_type;
    }

    private peek(): YASLToken {
        if (this.next_index >= this.tokens.length)
            return this.tokens[this.tokens.length - 1]!;
        return this.tokens[this.next_index]!;
    }

    /**
     *if next token matches the `token_type` consumes and returns the next token, otherwise returns null and emits an error
     */
    private expect(token_type: YASLTokenType, msg?: string) {
        if (this.peek().type === token_type) {
            return this.consume();
        } else {
            this.errorToken(msg ?? `Expected ${token_type} but got ${this.peek()}`);
            return null;
        }

    }

    private isEOF() {
        return this.next_index >= this.tokens.length;
    }


    private parseExpression() {
        const token = this.peek();
        let node = null;
        switch (token.type) {

            case YASLTokenType.STATEMENT_END:
                this.consume();
                break;
            case YASLTokenType.NUMBER:
            case YASLTokenType.LPAREN:
            case YASLTokenType.IDENTIFIER:
                node = this.consumeExpression();
                break;
            // case YASLTokenType.LBRACE:
            //     node = this.consumeBlock();
            //     break
            default:

                this.errorToken(`Invalid token in parseExpression`, token);
                break;
        }

        return node;

    }


    private parseDeclaration() {
        this.expect(YASLTokenType.LET, "Assignment requires let");
        // storing identifier
        const identifier = this.expect(YASLTokenType.IDENTIFIER, "Expected an identifier");
        if (!identifier) return;
        // checking for type
        let types: Set<YASLValueType> | null = null;
        if (this.match(YASLTokenType.COLON)) {
            this.consume(); // consume the colon and get type

            if (this.peek().type === YASLTokenType.IDENTIFIER)
                types = this.consumeValueType();
        }

        if (this.match(YASLTokenType.STATEMENT_END)) {
            this.program.addStatement(this.node_factory.getDeclarationStatement(identifier.lexeme, null, types, identifier.start, identifier.end));
            return;
        }

        this.expect(YASLTokenType.ASSIGN, "Invalid token");
        const value_node = this.consumeExpression();
        const node = this.node_factory.getDeclarationStatement(identifier.lexeme, value_node, types, identifier.start, value_node ? value_node.endIndex : identifier.end);
        this.program.addStatement(node);
    }

    private consumeValueType() {
        const allowed_types = new Set<YASLValueType>();
        while (true) {
            const token = this.peek();
            const value_type = parseTypeToken(token);
            if (value_type === null) {
                if (token.type !== YASLTokenType.BIT_OR) {
                    break;
                }
            } else {
                allowed_types.add(value_type);
            }
            this.consume();
        }
        return allowed_types;
    }

    /**
     * Runs first on the left most operand. It handles parsing prefix operators and values.
     * @param token must have been consumed before passing into this function
     * @private
     */
    private nud(token: YASLToken): YASLExpression | null {
        switch (token.type) {
            case YASLTokenType.MINUS:
            case YASLTokenType.NOT: {
                const right_node = this.consumeExpression(0);
                if (right_node && YASLNodeTypeChecker.isExpression(right_node))
                    return this.node_factory.getUnaryExpression(token.type as YASLTokenUnaryOp, right_node, token.start, right_node.endIndex);
                break;
            }
            case YASLTokenType.NUMBER:
                return this.node_factory.getLiteralNode(new YASLNativeValue(token.literal as number), token.start, token.end);
            case YASLTokenType.IDENTIFIER:
                return this.node_factory.getIdentifierNode(token);
            case YASLTokenType.LPAREN: {
                const expr = this.consumeExpression();
                this.expect(YASLTokenType.RPAREN);
                return expr;
            }
            case YASLTokenType.LBRACKET: {
                const values: YASLExpression[] = [];
                while (this.peek().type !== YASLTokenType.RBRACKET) {
                    if (this.isEOF()) {
                        this.errorToken("Unexpected EOF while reading array");
                        break;
                    }
                    const exp = this.consumeExpression(0);
                    if (exp)
                        values.push(exp);
                    token = this.peek();
                    if (token.type === YASLTokenType.COMMA) {
                        this.consume();
                    } else if (token.type === YASLTokenType.RBRACKET) {
                        this.consume();
                        this.parenthesis_count--;
                        break;
                    } else {
                        this.errorToken("Expected ) at the end of function call", token);
                        break;
                    }
                }

                return this.node_factory.getArrayLiteral(values);
            }
            case YASLTokenType.TRUE:
                return this.node_factory.getLiteralNode(new YASLNativeValue(true), token.start, token.end);
            case YASLTokenType.FALSE:
                return this.node_factory.getLiteralNode(new YASLNativeValue(false), token.start, token.end);
            case YASLTokenType.STRING:
                return this.node_factory.getLiteralNode(new YASLNativeValue(token.literal as string), token.start, token.end);
            default:
                this.errorToken(`Unexpected token in nud: ${token.lexeme}`, token);
                break;
        }
        return null;
    }

    /**
     * @param op_token Must be pre consumed
     * @param left_node
     * @param bp
     */
    private led(op_token: YASLToken, left_node: YASLExpression, bp: [ number, number ]): YASLExpression | null {
        const [ , right_bp ] = bp;
        // Postfix operators
        if (isPostfixOperator(op_token.type)) {
            if (!isExpressionTerminator(this.peek().type)) {
                this.errorToken("Postfix operators can only be followed by an expression terminator");
            }
            if (!YASLNodeTypeChecker.isLValue(left_node)) {
                this.errorToken("Postfix operator can only be applied to a LValue");
                return null;
            }
            return this.node_factory.getPostfixOperation(op_token, left_node);
        }

        // Indexing operator
        // identifier followed by '[' marks start of array access
        if (op_token.type === YASLTokenType.LBRACKET) {
            const index = this.consumeExpression(0);
            if (!index) {
                this.errorToken("Invalid expression used for index");
            }
            this.expect(YASLTokenType.RBRACKET, "Expected ']' ");
            if (index)
                return this.node_factory.getIndexOperation(left_node, index);
        }

        // Function call
        if (op_token.type === YASLTokenType.LPAREN) {
            if (!YASLNodeTypeChecker.isLValue(left_node)) {
                this.errorToken("Invalid function call. Only a valid LValue can have a function call");
                return null;
            }

            // Argument parsing
            const args: YASLExpression[] = [];
            this.parenthesis_count++;
            if (!this.match(YASLTokenType.RPAREN)) {
                let token = null;
                while (!this.isEOF()) {
                    const expr = this.consumeExpression(0);
                    if (expr)
                        args.push(expr);

                    token = this.peek();
                    if (token.type === YASLTokenType.COMMA) {
                        this.consume();
                    } else if (token.type === YASLTokenType.RPAREN) {
                        this.consume();
                        this.parenthesis_count--;
                        break;
                    } else {
                        this.errorToken("Expected ) at the end of function call", token);
                        break;
                    }
                }
            } else {
                //left parenthesis was immediately followed by right parenthesis
                this.consume();
            }
            return this.node_factory.getCallNode(left_node, args);
        }

        //For binary operators only
        const right_node = this.consumeExpression(right_bp);
        if (!right_node)
            return null;

        //Assignment
        if (op_token.type === YASLTokenType.INLINE_ASSIGN) {
            return this.node_factory.getAssignmentExpression(left_node, right_node);
        }
        //Property access
        if (op_token.type === YASLTokenType.DOT) {
            if (YASLNodeTypeChecker.isExpression(left_node) && YASLNodeTypeChecker.isExpression(right_node)) {
                return this.node_factory.getPropertyAccessExpression(left_node, right_node);
            }
            this.errorToken("The right side of property access must be a valid identifier but was " + formatter.formatNodeType(left_node.type));
            return null;
        }
        return this.node_factory.getBinaryExpression(op_token.type as YASLTokenBinaryOp, left_node, right_node);
    }

    /**
     * @param min_binding_power Operators with binding power less than this will be ignored
     */
    private consumeExpression(min_binding_power: number = 0): YASLExpression | null {
        const token = this.consume();
        // console.log("lexeme", token)
        let left_node = this.nud(token);

        while (!this.isEOF()) {
            if (!left_node)
                return null;

            const op_token = this.peek();
            if (!isOperator(op_token)) {
                return left_node;
            }

            const bp = getBindingPower(op_token.type);
            if (!bp) break;
            const [ left_binding_power ] = bp;

            if (left_binding_power < min_binding_power) break;


            this.consume();//consume the operator
            left_node = this.led(op_token, left_node, bp);

        }

        return left_node;
    }
}
