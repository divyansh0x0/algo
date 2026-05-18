import { PrettyPrinterVisitor } from "../visitors/PrettyPrinterVisitor";
import type { LineMap } from "../../LineMap";
import { YNativeValueWrapper } from "../natives/YNativeValueWrapper";
import { type YExpression, YProgram, type YStatement, type YValueType } from "../YAst";
import { YNodeFactory } from "../YNodeFactory";
import { YTypeChecker } from "../YTypeChecker";
import { type YToken, type YTokenBinaryOp, YTokenType, type YTokenUnaryOp } from "../YToken";
import {
    getAugmentedAssignmentOperatorToken,
    getBindingPower,
    isAssignmentOperator,
    isExpressionTerminator,
    isOperator,
    isPostfixOperator,
    parseTypeToken,
    type YTokenAugmentedAssignOp
} from "./YHelpers";
import type { YParserError } from "./YParserError";
import type { ExpBlockNode, StmtDeclarationNode } from "../YNode";

export class YParser {
    private next_index = 0;
    private parenthesis_count = 0;

    private program = new YProgram();
    private nodeFactory = new YNodeFactory();

    private errors = Array<YParserError>();

    constructor(private tokens: YToken[], private line_map: LineMap) {

    }

    getProgram(): YProgram {
        while (!this.isEOF()) {
            const statement = this.parseStatement();
            if (statement !== null) {
                this.program.addStatement(statement);
            }
        }
        return this.program;
    }

    getErrors() {
        return this.errors;
    }

    private parseStatement(): YStatement | null {
        const token = this.peek();

        switch (token.type) {
            case YTokenType.STATEMENT_END:
                this.consume();
                return null;
            case YTokenType.LET:
                return this.parseDeclaration();
            case YTokenType.IDENTIFIER: {
                return this.parseAssignmentStatement();
            }
            case YTokenType.FOR:
                return this.parseForStatement();
            default: {
                const exp = this.parseExpression();
                if (exp)
                    return this.nodeFactory.getStatementExpression(exp);
            }

        }
        return null;

    }
    private parseAssignmentStatement() {
        const lvalue = this.consumeExpression();
        if (!lvalue) {
            this.errorToken("Invalid lvalue", lvalue);
            return null;
        }

        console.log(lvalue)
        if (!isAssignmentOperator(this.peek().type) && !this.match(YTokenType.STATEMENT_END)) {
            this.errorToken(`Invalid token after lvalue ${this.peek().lexeme}`, this.peek())
        }

        // If no assignment operature then treat the statement as expression statement
        if (!isAssignmentOperator(this.peek().type)) {
            return this.nodeFactory.getStatementExpression(lvalue);
        }
        const op = this.consume()
        const rvalue = this.consumeExpression();
        if (!rvalue) {
            this.errorToken("Invalid RValue");
            return null;
        }
        if (op.type === YTokenType.ASSIGN) {
            return this.nodeFactory.getAssignmentStatement(lvalue, rvalue);
        }
        return this.nodeFactory.getAssignmentStatement(
            lvalue,
            this.nodeFactory.getBinaryExpression(
                getAugmentedAssignmentOperatorToken(op.type as YTokenAugmentedAssignOp),
                lvalue,
                rvalue)
        );



    }

    private parseForStatement() {
        const token = this.consume() // consume for token
        this.expect(YTokenType.LPAREN, "Expected a ( after for keyword")
        let init_stmt;
        const viewer = new PrettyPrinterVisitor()
        if (this.match(YTokenType.LET)) {
            init_stmt = this.parseDeclaration()
        }
        else {
            init_stmt = this.parseAssignmentStatement();
        }
        this.expect(YTokenType.STATEMENT_END)
        const condition_stmt = this.parseExpression()
        this.expect(YTokenType.STATEMENT_END)

        // Iteration statement of for loop
        let iter_stmt = null;

        const lvalue = this.parseExpression();
        let rvalue = null;
        if (lvalue) {
            if (isAssignmentOperator(this.peek().type)) {
                const op = this.consume();
                rvalue = this.parseExpression()
                if (lvalue && rvalue) {
                    if (op.type === YTokenType.ASSIGN)
                        iter_stmt = this.nodeFactory.getAssignmentStatement(lvalue, rvalue)
                    else {
                        iter_stmt = this.nodeFactory.getAssignmentStatement(
                            lvalue,
                            this.nodeFactory.getBinaryExpression(
                                getAugmentedAssignmentOperatorToken(op.type as YTokenAugmentedAssignOp),
                                lvalue,
                                rvalue
                            )
                        )

                    }
                }

            }
            else {
                iter_stmt = this.nodeFactory.getStatementExpression(lvalue);
            }
        }

        this.expect(YTokenType.RPAREN)
        const body = this.parseExpression();
        if (!init_stmt || !condition_stmt || !iter_stmt || !body)
            return null
        return this.nodeFactory.getForStatement(init_stmt, condition_stmt, iter_stmt, body, token.start, this.peek().start)

    }
    private synchronize() {
        while (!this.isEOF()) {
            const next_token = this.peek();
            if (next_token.type !== YTokenType.STATEMENT_END)
                this.consume();
            else
                break;
        }
    }

    private errorToken(msg: string, token: YToken | null = null) {
        const error_token = token == null ? this.tokens[this.next_index - 1] : token;
        if (error_token != null) {
            const [line1, col1] = this.line_map.indexToLineCol(error_token.start);
            const [line2, col2] = this.line_map.indexToLineCol(error_token.end);
            this.errors.push({
                message: msg,
                token: error_token,
                highlight: "",
                start_col: col1,
                end_col: col2,
                start_line: line1,
                end_line: line2
            });
            // throw Error(msg);
        }

        this.synchronize();
    }

    private consume(): YToken {
        console.assert(this.next_index < this.tokens.length, "For some reason index of next token exceeded token stream length");
        const token = this.tokens[this.next_index];
        if (this.next_index < this.tokens.length)
            this.next_index++;
        return token!;
    }

    /**
     * @returns {boolean} true if next token matches the `token_type` otherwise false. Does not consume the token
     */
    private match(token_type: YTokenType): boolean {
        return this.peek().type === token_type;
    }

    /**
     * @returns {YToken} the next token without consuming it
     */
    private peek(): YToken {
        if (this.next_index >= this.tokens.length)
            return this.tokens[this.tokens.length - 1]!;
        return this.tokens[this.next_index]!;
    }

    /**
     * @returns {YToken | null} if next token matches the `token_type` consumes and returns the next token, otherwise returns null and emits an error
     */
    private expect(token_type: YTokenType, msg?: string): YToken | null {
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


    private parseExpression(): YExpression | null {
        const token = this.peek();
        let node = null;
        switch (token.type) {

            case YTokenType.STATEMENT_END:
                this.consume();
                break;
            case YTokenType.NUMBER:
            case YTokenType.LPAREN:
            case YTokenType.IDENTIFIER:
                node = this.consumeExpression();
                break;
            case YTokenType.LBRACE:
                node = this.consumeBlock();
                break
            default:

                this.errorToken(`Invalid token in parseExpression ${token.lexeme}`, token);
                break;
        }

        return node;

    }
    private consumeBlock(): ExpBlockNode | null {
        const lbrace = this.consume();
        const statements: YStatement[] = [];
        while (!this.isEOF() && this.peek().type !== YTokenType.RBRACE) {
            const statement = this.parseStatement();
            if (statement !== null) {
                statements.push(statement);
            }
        }
        const rbrace = this.expect(YTokenType.RBRACE);
        if (!rbrace) {
            this.errorToken(`Expected a right brace }`, rbrace);
            return null;
        }
        return this.nodeFactory.getBlockExpression(statements, lbrace.start, rbrace.end);

    }


    private parseDeclaration(): StmtDeclarationNode | null {
        this.expect(YTokenType.LET, "Assignment requires let");
        // storing identifier
        const identifier = this.expect(YTokenType.IDENTIFIER, "Expected an identifier");
        if (!identifier) return null;
        // checking for type
        let types: Set<YValueType> | null = null;
        if (this.match(YTokenType.COLON)) {
            this.consume(); // consume the colon and get type

            if (this.peek().type === YTokenType.IDENTIFIER)
                types = this.consumeValueType();
        }

        if (this.match(YTokenType.STATEMENT_END)) {
            this.program.addStatement(this.nodeFactory.getDeclarationStatement(identifier.lexeme, null, types, identifier.start, identifier.end));
            return null;
        }

        this.expect(YTokenType.ASSIGN, "Invalid token");
        const value_node = this.consumeExpression();
        const node = this.nodeFactory.getDeclarationStatement(identifier.lexeme, value_node, types, identifier.start, value_node ? value_node.endIndex : identifier.end);
        return node;
    }

    private consumeValueType() {
        const allowed_types = new Set<YValueType>();
        while (true) {
            const token = this.peek();
            const value_type = parseTypeToken(token);
            if (value_type === null) {
                if (token.type !== YTokenType.BIT_OR) {
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
     */
    private nud(): YExpression | null {
        let token = this.consume();
        switch (token.type) {
            case YTokenType.MINUS:
            case YTokenType.NOT: {
                const right_node = this.consumeExpression(0);
                if (right_node && YTypeChecker.isExpression(right_node))
                    return this.nodeFactory.getUnaryExpression(token.type as YTokenUnaryOp, right_node, token.start, right_node.endIndex);
                break;
            }

            case YTokenType.NUMBER:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper(token.literal as number), token.start, token.end);
            case YTokenType.IDENTIFIER:
                return this.nodeFactory.getIdentifierNode(token);
            case YTokenType.LPAREN: {
                const expr = this.consumeExpression();
                this.expect(YTokenType.RPAREN);
                return expr;
            }
            case YTokenType.IF: {
                this.expect(YTokenType.LPAREN, "Expected (")
                const condition = this.consumeExpression()

                this.expect(YTokenType.RPAREN, "Expected )")
                let ifBody = null;
                if (this.match(YTokenType.LBRACE)) {
                    ifBody = this.consumeBlock()
                }
                else {
                    ifBody = this.consumeExpression()
                }
                // if its not followed by else, its a pure if statement which is invalid in expressions.
                this.expect(YTokenType.ELSE, "If must be followed by an else or else if statement inside an expression")
                let elseBody;
                // if else is followed by a brace then its a pure else statement
                if (this.match(YTokenType.LBRACE)) {
                    elseBody = this.consumeBlock();
                }
                else {
                    // otherwise treat the inside as an expression which can even be another if statement allowing else if statements
                    elseBody = this.consumeExpression(0)
                }
                if (!condition || !ifBody || !elseBody) {
                    return null;
                }
                return this.nodeFactory.getIfExpression(condition, ifBody, elseBody, token.start, this.next_index);
                // otherwise if its followed by a if statement
            }
            case YTokenType.LBRACKET: {
                const values: YExpression[] = [];
                while (this.peek().type !== YTokenType.RBRACKET) {
                    if (this.isEOF()) {
                        this.errorToken("Unexpected EOF while reading array");
                        break;
                    }
                    const exp = this.consumeExpression(0);
                    if (exp)
                        values.push(exp);
                    token = this.peek();
                    if (token.type === YTokenType.COMMA) {
                        this.consume();
                    } else if (token.type === YTokenType.RBRACKET) {
                        this.consume();
                        this.parenthesis_count--;
                        break;
                    } else {
                        this.errorToken("Expected ) at the end of function call", token);
                        break;
                    }
                }

                return this.nodeFactory.getArrayLiteral(values);
            }
            case YTokenType.TRUE:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper(true), token.start, token.end);
            case YTokenType.FALSE:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper(false), token.start, token.end);
            case YTokenType.STRING:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper(token.literal as string), token.start, token.end);
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
    private led(op_token: YToken, left_node: YExpression, bp: [number, number]): YExpression | null {
        const [, right_bp] = bp;
        // Postfix operators
        if (isPostfixOperator(op_token.type)) {
            if (!isExpressionTerminator(this.peek().type)) {
                this.errorToken("Postfix operators can only be followed by an expression terminator");
            }
            if (!YTypeChecker.isLValue(left_node)) {
                this.errorToken("Postfix operator can only be applied to a LValue");
                return null;
            }
            return this.nodeFactory.getPostfixOperation(op_token, left_node);
        }

        // Indexing operator
        // identifier followed by '[' marks start of array access
        if (op_token.type === YTokenType.LBRACKET) {
            const index = this.consumeExpression(0);
            if (!index) {
                this.errorToken("Invalid expression used for index");
            }
            this.expect(YTokenType.RBRACKET, "Expected ']' ");
            if (index)
                return this.nodeFactory.getIndexOperation(left_node, index);
        }

        // Function call
        if (op_token.type === YTokenType.LPAREN) {
            if (!YTypeChecker.isLValue(left_node)) {
                this.errorToken("Invalid function call. Only a valid LValue can have a function call");
                return null;
            }

            // Argument parsing
            const args: YExpression[] = [];
            this.parenthesis_count++;
            if (!this.match(YTokenType.RPAREN)) {
                let token = null;
                while (!this.isEOF()) {
                    const expr = this.consumeExpression(0);
                    if (expr)
                        args.push(expr);

                    token = this.peek();
                    if (token.type === YTokenType.COMMA) {
                        this.consume();
                    } else if (token.type === YTokenType.RPAREN) {
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
            return this.nodeFactory.getCallNode(left_node, args);
        }


        //For binary operators only
        const right_node = this.consumeExpression(right_bp);
        if (!right_node)
            return null;

        //Assignment
        if (op_token.type === YTokenType.INLINE_ASSIGN) {
            return this.nodeFactory.getAssignmentExpression(left_node, right_node);
        }
        //Property access
        if (op_token.type === YTokenType.DOT) {
            if (YTypeChecker.isExpression(left_node) && YTypeChecker.isExpression(right_node)) {
                return this.nodeFactory.getPropertyAccessExpression(left_node, right_node);
            }
            this.errorToken("The right side of property access must be a valid identifier but was " + left_node.type);
            return null;
        }
        return this.nodeFactory.getBinaryExpression(op_token.type as YTokenBinaryOp, left_node, right_node);
    }

    /**
     * @param min_binding_power Operators with binding power less than this will be ignored
     */
    private consumeExpression(min_binding_power: number = 0): YExpression | null {
        let left_node = this.nud();

        while (!this.isEOF()) {
            if (!left_node)
                return null;

            const op_token = this.peek();
            if (!isOperator(op_token)) {
                return left_node;
            }

            const bp = getBindingPower(op_token.type);
            if (!bp) break;
            const [left_binding_power] = bp;

            if (left_binding_power < min_binding_power) break;


            this.consume();//consume the operator
            left_node = this.led(op_token, left_node, bp);

        }

        return left_node;
    }
}
