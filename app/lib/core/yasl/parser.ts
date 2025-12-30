/**
 * The language treats only Let as a statement. Everything else is an expression;
 */


import {formatter} from "@/lib/core/yasl/formatter";
import {
    type IdentifierNode,
    type YASLExpression,
    type YASLNode,
    YASLNodeFactory,
    YASLNodeType,
    YASLNodeTypeChecker,
    YASLProgram,
    YASLValueType
} from "@/lib/core/yasl/tree";
import {type YASLTokenBinaryOp, YASLTokenType, type YASLTokenUnaryOp, type YASLToken} from "@/lib/core/yasl/YASLToken";

export interface ParserError {
    message: string;
    token: YASLToken;
    highlight: string;
    start_col: number;
    end_col: number;
    start_line: number;
    end_line: number;
}

function parseTypeToken(token: YASLToken): YASLValueType | null {
    switch (token.lexeme) {
        case "string":
        case "int":
        case "Set":
        case "Queue":
        case "Function":
            return token.lexeme as YASLValueType;
        default:
            return null;
    }
}

function isOperator(token: YASLToken) {
    if (!token)
        return false;
    switch (token.type) {
        case YASLTokenType.LPAREN:
        case YASLTokenType.DOT:
        case YASLTokenType.MODULO:
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.DIVIDE:
        case YASLTokenType.PLUS:
        case YASLTokenType.MINUS:
        case YASLTokenType.POWER:
        case YASLTokenType.INLINE_ASSIGN:
        case YASLTokenType.DECREMENT:
        case YASLTokenType.INCREMENT:
            return true;
        default:
            return false;
    }
}

function getBindingPower(token_type: YASLTokenType): [number, number] | null {
    //right associative has lower right power while left associative has lower left power
    switch (token_type) {
        case YASLTokenType.DOT:
            return [100, 101];

        case YASLTokenType.LPAREN:
            return [90, 91];
        case YASLTokenType.AND:
        case YASLTokenType.OR:
            return [80, 81];
        case YASLTokenType.INCREMENT:
        case YASLTokenType.DECREMENT:
            return [80, -1];
        case YASLTokenType.POWER:
            return [30, 29];
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.MODULO:
        case YASLTokenType.DIVIDE:
            return [20, 21];
        case YASLTokenType.MINUS:
        case YASLTokenType.PLUS:
            return [10, 11];
        case YASLTokenType.INLINE_ASSIGN:
            return [1, 0];

        default:
            return null;
    }
}

function isAssignmentOperator(type: YASLTokenType): boolean {
    switch (type) {
        case YASLTokenType.ASSIGN:
        case YASLTokenType.MULTIPLY_ASSIGN:
        case YASLTokenType.DIVIDE_ASSIGN:
        case YASLTokenType.MOD_ASSIGN:
        case YASLTokenType.POW_ASSIGN:
        case YASLTokenType.PLUS_ASSIGN:
        case YASLTokenType.MINUS_ASSIGN:
            return true;
        default:
            return false;
    }
}


function isPostfixOperator(type: YASLTokenType): boolean {
    switch (type) {
        case YASLTokenType.INCREMENT:
        case YASLTokenType.DECREMENT:
            return true;
        default:
            return false;

    }
}

function isExpressionTerminator(type: YASLTokenType): boolean {
    switch (type) {
        case YASLTokenType.STATEMENT_END:
        case YASLTokenType.MODULO:
        case YASLTokenType.MULTIPLY:
        case YASLTokenType.DIVIDE:
        case YASLTokenType.PLUS:
        case YASLTokenType.MINUS:
        case YASLTokenType.POWER:
            return true;
        default:
            return false;

    }
}

function binarySearch(target: number, arr: number[]): number {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = (low + high) >>> 1; // unsigned right shift = fast floor divide by 2
        if (arr[mid] === target) return mid;
        if (arr[mid]! < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // not found
}

function indexToLineCol(offset: number, line_map: number[]): [number, number] {
    let line = binarySearch(offset, line_map);
    let col = offset - line_map[line]!;
    return [line, col];
}

export class Parser {
    private next_index = 0;
    private parenthesis_count = 0;

    private program = new YASLProgram();
    private node_factory = new YASLNodeFactory();

    private errors = Array<ParserError>();

    constructor(private tokens: YASLToken[], private line_map: number[]) {

    }

    getProgram(): YASLProgram {
        while (!this.isEOF()) {
            this.parseStatement();
        }
        return this.program;
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
            case YASLTokenType.IDENTIFIER:
                const lvalue = this.consumeExpression();
                if (!lvalue) {
                    this.errorToken("Invalid statement", token);
                    break;
                }

                const next_token = this.peek();
                if (next_token.type === YASLTokenType.INLINE_ASSIGN) {
                    this.errorToken("Inline assignment used as normal assignment, use '=' for assignments in a statement");
                    break;
                }
                if (isAssignmentOperator(next_token.type)) {
                    this.consume();
                    if (!YASLNodeTypeChecker.isLValue(lvalue)) {
                        this.errorToken("Invalid LValue");
                        break;
                    }
                    const rvalue = this.consumeExpression();
                    if (!rvalue) {
                        this.errorToken("Invalid RValue");
                        break;
                    }
                    this.program.addStatement(this.node_factory.getAssignmentExpression(next_token, lvalue, rvalue));

                } else {
                    this.program.addStatement(lvalue);
                }
                break;
            default:
                this.parseExpression();
                break;


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
            const [line1, col1] = indexToLineCol(error_token.start, this.line_map);
            const [line2, col2] = indexToLineCol(error_token.end, this.line_map);
            this.errors.push({
                message: msg,
                token: error_token,
                highlight: "",
                start_col: col1,
                end_col: col2,
                start_line: line1,
                end_line: line2
            });
        }


        this.synchronize();
    }

    private consume(): YASLToken {

        const token = this.tokens[this.next_index];
        if (this.next_index < this.tokens.length - 1) {
            this.next_index++;
        }
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
     * consumes the token and returns it if it matches the token type otherwise returns null
     */
    private expect(token_type: YASLTokenType, msg: string) {
        if (this.peek().type === token_type) {
            return this.consume();
        } else {
            this.errorToken(msg);
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
            default:
                this.errorToken(`Invalid token`, token);
                break;
        }

        if (node)
            this.program.addStatement(node);

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
        const node = this.node_factory.getDeclarationStatement(identifier.lexeme, value_node, types, identifier.start, value_node ? value_node.end_index : identifier.end);
        this.program.addStatement(node);
    }

    private consumeValueType() {
        let allowed_types = new Set<YASLValueType>();
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

    private nud(token: YASLToken): YASLExpression | null {
        switch (token.type) {
            case YASLTokenType.MINUS:
            case YASLTokenType.NOT: {
                const right_node = this.consumeExpression(0);
                if (right_node && YASLNodeTypeChecker.isExpression(right_node))
                    return this.node_factory.getUnaryExpression(token.type as YASLTokenUnaryOp, right_node, token.start, right_node.end_index);
                break;
            }
            case YASLTokenType.NUMBER:
                return this.node_factory.getLiteralNode(token.literal as number, YASLValueType.number, token.start, token.end);
            case YASLTokenType.IDENTIFIER:
                return this.node_factory.getIdentifierNode(token);
            case YASLTokenType.LPAREN:
                const expr = this.consumeExpression();
                this.expect(YASLTokenType.RPAREN, "Expected ) but found " + this.peek().lexeme);
                return expr;
            case YASLTokenType.STRING:
                return this.node_factory.getLiteralNode(token.literal as string, YASLValueType.string, token.start, token.end);
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
    private led(op_token: YASLToken, left_node: YASLNode, bp: [number, number]): YASLExpression | null {
        const [, right_bp] = bp;


        if (op_token.type === YASLTokenType.LPAREN) {
            if (!YASLNodeTypeChecker.isLValue(left_node)) {
                this.errorToken("Invalid function call. Only a valid LValue can have a function call");
                return null;
            }
            const args: YASLNode[] = [];
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
            if (!YASLNodeTypeChecker.isLValue(left_node)) {
                this.errorToken(`${formatter.formatAstJSON(left_node)} is an invalid LValue`, op_token);
                return null;
            }
            return this.node_factory.getAssignmentExpression(op_token, left_node, right_node);

            // If the op is a dot then i

        }
        if (op_token.type === YASLTokenType.DOT) {
            if (right_node.type === YASLNodeType.IDENTIFIER && YASLNodeTypeChecker.isLValue(left_node)) {
                return this.node_factory.getPropertyAccessExpression(left_node, right_node as IdentifierNode);
            }
            this.errorToken("The right side of property access must be a valid identifier but was " + formatter.formatNodeType(left_node.type));
            return null;
        }

        if (YASLNodeTypeChecker.isExpression(left_node) && YASLNodeTypeChecker.isExpression(right_node))
            return this.node_factory.getBinaryExpression(op_token.type as YASLTokenBinaryOp, left_node, right_node);
        else {
            this.errorToken("Invalid expression", op_token);
        }
        return null;
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
            const [left_binding_power] = bp;

            if (left_binding_power < min_binding_power) break;


            this.consume();//consume the operator
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


            left_node = this.led(op_token, left_node, bp);

        }

        return left_node;
    }


}

