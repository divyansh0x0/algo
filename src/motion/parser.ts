/**
 * The language treats only Let as a statement. Everything else is an expression;
 */


import { Ast } from "@/motion/ast/ast";
import { formatter } from "@/motion/formatter";
import { Token, TokenType } from "@/motion/tokens/token";
import NodeType = Ast.NodeType;

export interface ParserError {
    message: string;
    token: Token;
    highlight: string;
    line: number,
    col: number,
}

function parseTypeToken(token: Token): Ast.ValueType | null {
    switch (token.lexeme) {
        case "string":
        case "int":
        case "Set":
        case "Queue":
        case "Function":
            return token.lexeme as Ast.ValueType;
        default:
            return null;
    }
}

function isOperator(token: Token) {
    if (!token)
        return false;
    switch (token.type) {
        case TokenType.LPAREN:
        case TokenType.DOT:
        case TokenType.MODULO:
        case TokenType.MULTIPLY:
        case TokenType.DIVIDE:
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.POWER:
        case TokenType.ASSIGN:
        case TokenType.MULTIPLY_ASSIGN:
        case TokenType.DIVIDE_ASSIGN:
        case TokenType.MOD_ASSIGN:
        case TokenType.POW_ASSIGN:
        case TokenType.PLUS_ASSIGN:
        case TokenType.MINUS_ASSIGN:

        case TokenType.DECREMENT:
        case TokenType.INCREMENT:
            return true;
        default:
            return false;
    }
}

function getBindingPower(token_type: TokenType): [ number, number ] | null {
    //right associative has lower right power while left associative has lower left power
    switch (token_type) {
        case TokenType.DOT:
            return [ 100, 101 ];

        case TokenType.LPAREN:
            return [ 90, 91 ];
        case TokenType.INCREMENT:
        case TokenType.DECREMENT:
            return [ 80, -1 ];
        case TokenType.POWER:
            return [ 30, 29 ];
        case TokenType.MULTIPLY:
        case TokenType.MODULO:
        case TokenType.DIVIDE:
            return [ 20, 21 ];
        case TokenType.MINUS:
        case TokenType.PLUS:
            return [ 10, 11 ];
        case TokenType.ASSIGN:
        case TokenType.MULTIPLY_ASSIGN:
        case TokenType.DIVIDE_ASSIGN:
        case TokenType.MOD_ASSIGN:
        case TokenType.POW_ASSIGN:
        case TokenType.PLUS_ASSIGN:
        case TokenType.MINUS_ASSIGN:
            return [ 1, 0 ];

        default:
            return null;
    }
}

function isAssignmentOperator(type: TokenType): boolean {
    switch (type) {
        case TokenType.ASSIGN:
        case TokenType.MULTIPLY_ASSIGN:
        case TokenType.DIVIDE_ASSIGN:
        case TokenType.MOD_ASSIGN:
        case TokenType.POW_ASSIGN:
        case TokenType.PLUS_ASSIGN:
        case TokenType.MINUS_ASSIGN:
            return true;
        default:
            return false;
    }
}

function isLValue(node_type: Ast.NodeType): boolean {
    return node_type === NodeType.PROPERTY_ACCESS_EXPRESSION || node_type === NodeType.IDENTIFIER;
}

function isPostfixOperator(type: TokenType): boolean {
    switch (type) {
        case TokenType.INCREMENT:
        case TokenType.DECREMENT:
            return true;
        default:
            return false;

    }
}

function isExpressionTerminator(type: TokenType): boolean {
    switch (type) {
        case TokenType.STATEMENT_END:
        case TokenType.MODULO:
        case TokenType.MULTIPLY:
        case TokenType.DIVIDE:
        case TokenType.PLUS:
        case TokenType.MINUS:
        case TokenType.POWER:
            return true;
        default:
            return false;

    }
}

export class Parser {
    errors = Array<ParserError>();
    private next_index = 0;
    private curr_node: Ast.Node | null = null;
    private root_node: Ast.Node | null = null;
    private parenthesis_count = 0;

    constructor(private tokens: Token[]) {
    }

    getAst(): Ast.Node | null {
        while (!this.isEOF()) {
            this.parseToken();
        }
        return this.root_node;
    }

    private parseToken() {
        const token = this.peek();
        if (token.type === TokenType.LET) {
            this.parseDeclaration();
        } else {
            this.parseExpression();
        }
    }

    private synchronize() {
        while (!this.isEOF()) {
            const next_token = this.peek();
            if (next_token.type !== TokenType.STATEMENT_END)
                this.consume();
            else
                break;
        }
    }

    private error(msg: string, token: Token | null = null) {
        const error_token = token == null ? this.tokens[this.next_index - 1] : token;
        this.errors.push({
            message: msg,
            token: error_token,
            line: error_token.line,
            col: error_token.col,
            highlight: this.getHighlight(this.next_index - 1)
        });
        this.synchronize();
    }

    private getHighlight(token_index: number): string {


        return "";
    }

    private consume(): Token {

        const token = this.tokens[this.next_index];
        this.next_index++;
        return token;
    }

    /**
     * consumes the token if it matches token type and returns true otherwise false
     */
    private match(token_type: TokenType): boolean {
        return this.peek().type === token_type;
    }

    private peek() {
        if (this.next_index >= this.tokens.length)
            return this.tokens[this.tokens.length - 1];
        return this.tokens[this.next_index];
    }

    /**
     * consumes the token and returns it if it matches the token type otherwise returns null
     */
    private expect(token_type: TokenType, msg: string) {
        if (this.peek().type === token_type) {
            return this.consume();
        } else {
            this.error(msg);
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
            case TokenType.STATEMENT_END:
            case TokenType.EOF:
                this.consume();
                break;
            case TokenType.NUMBER:
            case TokenType.LPAREN:
            case TokenType.IDENTIFIER:
                node = this.consumeExpression();
                break;
            default:
                this.error(`Invalid token`, token);
                break;
        }

        if (node)
            this.addNode(node);

    }

    private addNode(node: Ast.Node) {
        if (this.root_node === null || this.curr_node == null) {
            this.root_node = node;
            this.curr_node = node;
        } else {
            this.curr_node.next_node = node;
            this.curr_node = node;
        }

    }

    private parseDeclaration() {
        this.match(TokenType.LET);
        // storing identifier
        const identifier = this.expect(TokenType.IDENTIFIER, "Expected an identifier");
        if (!identifier) return;
        // checking for type
        let types: Set<Ast.ValueType> | null = null;
        if (this.peek().type === TokenType.COLON) {
            this.consume(); // consume the colon and get type

            if (this.peek().type === TokenType.IDENTIFIER)
                types = this.consumeValueType();
        }


        //assignment operation
        const next_token = this.consume();
        let value: null | Ast.Node = null;
        if (next_token.type !== TokenType.STATEMENT_END) {
            switch (next_token.type) {
                case TokenType.ASSIGN:
                    break;
                default:
                    this.error("Invalid token. Expected assignment operator");
                    return;
            }
            const value_token = this.peek();
            if (value_token.type === TokenType.STATEMENT_END)
                this.error("Unexpected end after assignment");
            else
                value = this.consumeExpression();
        }
        const node = Ast.createDeclarationStatement(identifier.lexeme, value, types);
        this.addNode(node);
    }

    private consumeValueType() {
        let allowed_types = new Set<Ast.ValueType>();
        while (true) {
            const token = this.peek();
            const value_type = parseTypeToken(token);
            if (value_type === null) {
                if (token.type !== TokenType.BIT_OR) {
                    break;
                }
            } else {
                allowed_types.add(value_type);
            }
            this.consume();
        }
        return allowed_types;
    }

    private nud(token: Token): Ast.Node | null {
        switch (token.type) {
            case TokenType.NUMBER:
                return Ast.createLiteralNode(token.literal as number);
            case TokenType.IDENTIFIER:
                return Ast.createIdentifierNode(token.lexeme as string);
            case TokenType.LPAREN:
                const expr = this.consumeExpression();
                this.expect(TokenType.RPAREN, "Expected ) but found " + this.peek().lexeme);
                return expr;
            case TokenType.MINUS:
                const right_node = this.consumeExpression();
                if (right_node)
                    return Ast.createUnaryExpression(token, right_node);
                break;
            default:
                this.error(`Unexpected token in nud: ${ token.lexeme }`, token);
                break;
        }
        return null;
    }

    /**
     * @param op_token Must be pre consumed
     * @param left_node
     * @param bp
     */
    private led(op_token: Token, left_node: Ast.Node, bp: [ number, number ]): Ast.Node | null {
        const [ left_bp, right_bp ] = bp;


        if (op_token.type === TokenType.LPAREN) {
            if (!isLValue(left_node.node_type)) {
                this.error("Invalid function call. Only a valid LValue can have a function call");
                return null;
            }
            const args: Ast.Node[] = [];
            this.parenthesis_count++;
            if (!this.match(TokenType.RPAREN)) {
                let token = null;
                while (!this.isEOF()) {
                    const expr = this.consumeExpression(0);
                    if (expr)
                        args.push(expr);

                    token = this.peek();
                    if (token.type === TokenType.COMMA) {
                        this.consume();
                    } else if (token.type === TokenType.RPAREN) {
                        this.consume();
                        this.parenthesis_count--;
                        break;
                    } else {
                        this.error("Expected ) at the end of function call", token);
                        break;
                    }
                }
            } else {
                //left parenthesis was immediately followed by right parenthesis
                this.consume();
            }
            return Ast.createCallNode(left_node, args);
        }


        const right_node = this.consumeExpression(right_bp);

        if (!right_node)
            return null;

        if (isAssignmentOperator(op_token.type)) {
            if (!isLValue(left_node.node_type)) {
                this.error(`${ formatter.formatNodeType(left_node.node_type) } is an invalid assignment target`, op_token);
                return null;
            }

            return Ast.createAssignmentExpression(op_token, left_node, right_node);
        }

        if (op_token.type === TokenType.DOT) {
            if (right_node.node_type !== Ast.NodeType.IDENTIFIER) {
                this.error("The right side of property access must be a valid identifier but was " + formatter.formatNodeType(left_node.node_type));
                return null;
            } else {
                return Ast.createPropertyAccessExpression(left_node, right_node as Ast.IdentifierNode);
            }
        }

        return Ast.createBinaryExpression(op_token, left_node, right_node);
    }

    /**
     * @param min_binding_power Operators with binding power less than this will be ignored
     */
    private consumeExpression(min_binding_power: number = 0): Ast.Node | null {
        const token = this.consume();
        let left_node: null | Ast.Node = this.nud(token);

        while (!this.isEOF()) {
            if (!left_node)
                return null;

            const op_token = this.peek();
            if (!isOperator(op_token)) {
                return left_node;
            }

            const bp = getBindingPower(op_token.type);
            if (!bp) break;
            const [ left_binding_power, right_binding_power ] = bp;

            if (left_binding_power < min_binding_power) break;


            this.consume();//consume the operator
            if (isPostfixOperator(op_token.type)) {
                if (!isExpressionTerminator(this.peek().type)) {
                    this.error("Postfix operators can only be followed by an expression terminator");
                }
                if (!isLValue(left_node.node_type)) {
                    this.error("Postfix operator can only be applied to a LValue");
                    return null;
                }
                return Ast.createPostfixOperation(op_token, left_node);
            }


            left_node = this.led(op_token, left_node, bp);

        }

        return left_node;
    }


}

