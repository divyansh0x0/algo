"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YParser = void 0;
var YNativeValueWrapper_1 = require("../natives/YNativeValueWrapper");
var YAst_1 = require("../YAst");
var YNodeFactory_1 = require("../YNodeFactory");
var YToken_1 = require("../YToken");
var YTypeChecker_1 = require("../YTypeChecker");
var YHelpers_1 = require("./YHelpers");
var YParser = /** @class */ (function () {
    function YParser(tokens, line_map) {
        this.tokens = tokens;
        this.line_map = line_map;
        this.next_index = 0;
        this.parenthesis_count = 0;
        this.program = new YAst_1.YProgram();
        this.nodeFactory = new YNodeFactory_1.YNodeFactory();
        this.errors = Array();
    }
    YParser.prototype.getProgram = function () {
        while (!this.isEOF()) {
            var statement = this.parseStatement();
            if (statement !== null) {
                this.program.addStatement(statement);
            }
        }
        return this.program;
    };
    YParser.prototype.getErrors = function () {
        return this.errors;
    };
    YParser.prototype.parseStatement = function () {
        var token = this.peek();
        switch (token.type) {
            case YToken_1.YTokenType.STATEMENT_END:
                this.consume();
                return null;
            case YToken_1.YTokenType.LET:
                return this.parseDeclaration();
            case YToken_1.YTokenType.IDENTIFIER: {
                return this.parseAssignmentStatement();
            }
            case YToken_1.YTokenType.WHILE: {
                return this.parseWhileStatement();
            }
            case YToken_1.YTokenType.FOR:
                return this.parseForStatement();
            default: {
                var exp = this.parseExpression();
                if (exp)
                    return this.nodeFactory.getStatementExpression(exp);
            }
        }
        return null;
    };
    YParser.prototype.parseAssignmentStatement = function () {
        var lvalue = this.consumeExpression();
        if (!lvalue) {
            this.errorToken("Invalid lvalue", lvalue);
            return null;
        }
        console.log(lvalue);
        if (!(0, YHelpers_1.isAssignmentOperator)(this.peek().type) && !this.match(YToken_1.YTokenType.STATEMENT_END)) {
            this.errorToken("Invalid token after lvalue ".concat(this.peek().lexeme), this.peek());
        }
        // If no assignment operature then treat the statement as expression statement
        if (!(0, YHelpers_1.isAssignmentOperator)(this.peek().type)) {
            return this.nodeFactory.getStatementExpression(lvalue);
        }
        var op = this.consume();
        var rvalue = this.consumeExpression();
        if (!rvalue) {
            this.errorToken("Invalid RValue");
            return null;
        }
        if (op.type === YToken_1.YTokenType.ASSIGN) {
            return this.nodeFactory.getAssignmentStatement(lvalue, rvalue);
        }
        return this.nodeFactory.getAssignmentStatement(lvalue, this.nodeFactory.getBinaryExpression((0, YHelpers_1.getAugmentedAssignmentOperatorToken)(op.type), lvalue, rvalue));
    };
    YParser.prototype.parseForStatement = function () {
        var token = this.consume(); // consume for token
        this.expect(YToken_1.YTokenType.LPAREN, "Expected a ( after for keyword");
        var init_stmt;
        if (this.match(YToken_1.YTokenType.LET)) {
            init_stmt = this.parseDeclaration();
        }
        else {
            init_stmt = this.parseAssignmentStatement();
        }
        this.expect(YToken_1.YTokenType.STATEMENT_END);
        var condition_stmt = this.parseExpression();
        this.expect(YToken_1.YTokenType.STATEMENT_END);
        // Iteration statement of for loop
        var iter_stmt = null;
        var lvalue = this.parseExpression();
        var rvalue = null;
        if (lvalue) {
            if ((0, YHelpers_1.isAssignmentOperator)(this.peek().type)) {
                var op = this.consume();
                rvalue = this.parseExpression();
                if (lvalue && rvalue) {
                    if (op.type === YToken_1.YTokenType.ASSIGN)
                        iter_stmt = this.nodeFactory.getAssignmentStatement(lvalue, rvalue);
                    else {
                        iter_stmt = this.nodeFactory.getAssignmentStatement(lvalue, this.nodeFactory.getBinaryExpression((0, YHelpers_1.getAugmentedAssignmentOperatorToken)(op.type), lvalue, rvalue));
                    }
                }
            }
            else {
                iter_stmt = this.nodeFactory.getStatementExpression(lvalue);
            }
        }
        this.expect(YToken_1.YTokenType.RPAREN);
        var body = this.parseExpression();
        if (!init_stmt || !condition_stmt || !iter_stmt || !body)
            return null;
        return this.nodeFactory.getForStatement(init_stmt, condition_stmt, iter_stmt, body, token.start, this.peek().start);
    };
    YParser.prototype.parseWhileStatement = function () {
        var token = this.consume();
        this.expect(YToken_1.YTokenType.LPAREN);
        var exp = this.parseExpression();
        this.expect(YToken_1.YTokenType.RPAREN);
        var body = this.parseExpression();
        if (exp && body) {
            return this.nodeFactory.getWhileStatement(exp, body, token.start, this.peek().start);
        }
        return null;
    };
    YParser.prototype.synchronize = function () {
        while (!this.isEOF()) {
            var next_token = this.peek();
            if (next_token.type !== YToken_1.YTokenType.STATEMENT_END)
                this.consume();
            else
                break;
        }
    };
    YParser.prototype.errorToken = function (msg, token) {
        if (token === void 0) { token = null; }
        var error_token = token == null ? this.tokens[this.next_index - 1] : token;
        if (error_token != null) {
            var _a = this.line_map.indexToLineCol(error_token.start), line1 = _a[0], col1 = _a[1];
            var _b = this.line_map.indexToLineCol(error_token.end), line2 = _b[0], col2 = _b[1];
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
    };
    YParser.prototype.consume = function () {
        console.assert(this.next_index < this.tokens.length, "For some reason index of next token exceeded token stream length");
        var token = this.tokens[this.next_index];
        if (this.next_index < this.tokens.length)
            this.next_index++;
        return token;
    };
    /**
     * @returns {boolean} true if next token matches the `token_type` otherwise false. Does not consume the token
     */
    YParser.prototype.match = function (token_type) {
        return this.peek().type === token_type;
    };
    /**
     * @returns {YToken} the next token without consuming it
     */
    YParser.prototype.peek = function () {
        if (this.next_index >= this.tokens.length)
            return this.tokens[this.tokens.length - 1];
        return this.tokens[this.next_index];
    };
    /**
     * @returns {YToken | null} if next token matches the `token_type` consumes and returns the next token, otherwise returns null and emits an error
     */
    YParser.prototype.expect = function (token_type, msg) {
        if (this.peek().type === token_type) {
            return this.consume();
        }
        else {
            this.errorToken(msg !== null && msg !== void 0 ? msg : "Expected ".concat(token_type, " but got ").concat(this.peek()));
            return null;
        }
    };
    YParser.prototype.isEOF = function () {
        return this.next_index >= this.tokens.length;
    };
    YParser.prototype.parseExpression = function () {
        var token = this.peek();
        var node = null;
        switch (token.type) {
            case YToken_1.YTokenType.STATEMENT_END:
                this.consume();
                break;
            case YToken_1.YTokenType.NUMBER:
            case YToken_1.YTokenType.LPAREN:
            case YToken_1.YTokenType.IDENTIFIER:
                node = this.consumeExpression();
                break;
            case YToken_1.YTokenType.LBRACE:
                node = this.consumeBlock();
                break;
            default:
                this.errorToken("Invalid token in parseExpression ".concat(token.lexeme), token);
                break;
        }
        return node;
    };
    YParser.prototype.consumeBlock = function () {
        var lbrace = this.consume();
        var statements = [];
        while (!this.isEOF() && this.peek().type !== YToken_1.YTokenType.RBRACE) {
            var statement = this.parseStatement();
            if (statement !== null) {
                statements.push(statement);
            }
        }
        var rbrace = this.expect(YToken_1.YTokenType.RBRACE);
        if (!rbrace) {
            this.errorToken("Expected a right brace }", rbrace);
            return null;
        }
        return this.nodeFactory.getBlockExpression(statements, lbrace.start, rbrace.end);
    };
    YParser.prototype.parseDeclaration = function () {
        this.expect(YToken_1.YTokenType.LET, "Assignment requires let");
        // storing identifier
        var identifier = this.expect(YToken_1.YTokenType.IDENTIFIER, "Expected an identifier");
        if (!identifier)
            return null;
        // checking for type
        var types = null;
        if (this.match(YToken_1.YTokenType.COLON)) {
            this.consume(); // consume the colon and get type
            if (this.peek().type === YToken_1.YTokenType.IDENTIFIER)
                types = this.consumeValueType();
        }
        if (this.match(YToken_1.YTokenType.STATEMENT_END)) {
            this.program.addStatement(this.nodeFactory.getDeclarationStatement(identifier.lexeme, null, types, identifier.start, identifier.end));
            return null;
        }
        this.expect(YToken_1.YTokenType.ASSIGN, "Invalid token");
        var value_node = this.consumeExpression();
        var node = this.nodeFactory.getDeclarationStatement(identifier.lexeme, value_node, types, identifier.start, value_node ? value_node.endIndex : identifier.end);
        return node;
    };
    YParser.prototype.consumeValueType = function () {
        var allowed_types = new Set();
        while (true) {
            var token = this.peek();
            var value_type = (0, YHelpers_1.parseTypeToken)(token);
            if (value_type === null) {
                if (token.type !== YToken_1.YTokenType.BIT_OR) {
                    break;
                }
            }
            else {
                allowed_types.add(value_type);
            }
            this.consume();
        }
        return allowed_types;
    };
    /**
     * Runs first on the left most operand. It handles parsing prefix operators and values.
     */
    YParser.prototype.nud = function () {
        var token = this.consume();
        switch (token.type) {
            case YToken_1.YTokenType.MINUS:
            case YToken_1.YTokenType.NOT: {
                var right_node = this.consumeExpression(0);
                if (right_node && YTypeChecker_1.YTypeChecker.isExpression(right_node))
                    return this.nodeFactory.getUnaryExpression(token.type, right_node, token.start, right_node.endIndex);
                break;
            }
            case YToken_1.YTokenType.NUMBER:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper_1.YNativeValueWrapper(token.literal), token.start, token.end);
            case YToken_1.YTokenType.IDENTIFIER:
                return this.nodeFactory.getIdentifierNode(token);
            case YToken_1.YTokenType.LPAREN: {
                var expr = this.consumeExpression();
                this.expect(YToken_1.YTokenType.RPAREN);
                return expr;
            }
            case YToken_1.YTokenType.IF: {
                this.expect(YToken_1.YTokenType.LPAREN, "Expected (");
                var condition = this.consumeExpression();
                this.expect(YToken_1.YTokenType.RPAREN, "Expected )");
                var ifBody = null;
                if (this.match(YToken_1.YTokenType.LBRACE)) {
                    ifBody = this.consumeBlock();
                }
                else {
                    ifBody = this.consumeExpression();
                }
                // if its not followed by else, its a pure if statement which is invalid in expressions.
                this.expect(YToken_1.YTokenType.ELSE, "If must be followed by an else or else if statement inside an expression");
                var elseBody = void 0;
                // if else is followed by a brace then its a pure else statement
                if (this.match(YToken_1.YTokenType.LBRACE)) {
                    elseBody = this.consumeBlock();
                }
                else {
                    // otherwise treat the inside as an expression which can even be another if statement allowing else if statements
                    elseBody = this.consumeExpression(0);
                }
                if (!condition || !ifBody || !elseBody) {
                    return null;
                }
                return this.nodeFactory.getIfExpression(condition, ifBody, elseBody, token.start, this.next_index);
                // otherwise if its followed by a if statement
            }
            case YToken_1.YTokenType.LBRACKET: {
                var values = [];
                while (this.peek().type !== YToken_1.YTokenType.RBRACKET) {
                    if (this.isEOF()) {
                        this.errorToken("Unexpected EOF while reading array");
                        break;
                    }
                    var exp = this.consumeExpression(0);
                    if (exp)
                        values.push(exp);
                    token = this.peek();
                    if (token.type === YToken_1.YTokenType.COMMA) {
                        this.consume();
                    }
                    else if (token.type === YToken_1.YTokenType.RBRACKET) {
                        this.consume();
                        this.parenthesis_count--;
                        break;
                    }
                    else {
                        this.errorToken("Expected ) at the end of function call", token);
                        break;
                    }
                }
                return this.nodeFactory.getArrayLiteral(values);
            }
            case YToken_1.YTokenType.TRUE:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper_1.YNativeValueWrapper(true), token.start, token.end);
            case YToken_1.YTokenType.FALSE:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper_1.YNativeValueWrapper(false), token.start, token.end);
            case YToken_1.YTokenType.STRING:
                return this.nodeFactory.getLiteralNode(new YNativeValueWrapper_1.YNativeValueWrapper(token.literal), token.start, token.end);
            default:
                this.errorToken("Unexpected token in nud: ".concat(token.lexeme), token);
                break;
        }
        return null;
    };
    /**
     * @param op_token Must be pre consumed
     * @param left_node
     * @param bp
     */
    YParser.prototype.led = function (op_token, left_node, bp) {
        var right_bp = bp[1];
        // Postfix operators
        if ((0, YHelpers_1.isPostfixOperator)(op_token.type)) {
            if (!(0, YHelpers_1.isExpressionTerminator)(this.peek().type)) {
                this.errorToken("Postfix operators can only be followed by an expression terminator");
            }
            if (!YTypeChecker_1.YTypeChecker.isLValue(left_node)) {
                this.errorToken("Postfix operator can only be applied to a LValue");
                return null;
            }
            return this.nodeFactory.getPostfixOperation(op_token, left_node);
        }
        // Indexing operator
        // identifier followed by '[' marks start of array access
        if (op_token.type === YToken_1.YTokenType.LBRACKET) {
            var index = this.consumeExpression(0);
            if (!index) {
                this.errorToken("Invalid expression used for index");
            }
            this.expect(YToken_1.YTokenType.RBRACKET, "Expected ']' ");
            if (index)
                return this.nodeFactory.getIndexOperation(left_node, index);
        }
        // Function call
        if (op_token.type === YToken_1.YTokenType.LPAREN) {
            if (!YTypeChecker_1.YTypeChecker.isLValue(left_node)) {
                this.errorToken("Invalid function call. Only a valid LValue can have a function call");
                return null;
            }
            // Argument parsing
            var args = [];
            this.parenthesis_count++;
            if (!this.match(YToken_1.YTokenType.RPAREN)) {
                var token = null;
                while (!this.isEOF()) {
                    var expr = this.consumeExpression(0);
                    if (expr)
                        args.push(expr);
                    token = this.peek();
                    if (token.type === YToken_1.YTokenType.COMMA) {
                        this.consume();
                    }
                    else if (token.type === YToken_1.YTokenType.RPAREN) {
                        this.consume();
                        this.parenthesis_count--;
                        break;
                    }
                    else {
                        this.errorToken("Expected ) at the end of function call", token);
                        break;
                    }
                }
            }
            else {
                //left parenthesis was immediately followed by right parenthesis
                this.consume();
            }
            return this.nodeFactory.getCallNode(left_node, args);
        }
        //For binary operators only
        var right_node = this.consumeExpression(right_bp);
        if (!right_node)
            return null;
        //Assignment
        if (op_token.type === YToken_1.YTokenType.INLINE_ASSIGN) {
            return this.nodeFactory.getAssignmentExpression(left_node, right_node);
        }
        //Property access
        if (op_token.type === YToken_1.YTokenType.DOT) {
            if (YTypeChecker_1.YTypeChecker.isExpression(left_node) && YTypeChecker_1.YTypeChecker.isExpression(right_node)) {
                return this.nodeFactory.getPropertyAccessExpression(left_node, right_node);
            }
            this.errorToken("The right side of property access must be a valid identifier but was " + left_node.type);
            return null;
        }
        return this.nodeFactory.getBinaryExpression(op_token.type, left_node, right_node);
    };
    /**
     * @param min_binding_power Operators with binding power less than this will be ignored
     */
    YParser.prototype.consumeExpression = function (min_binding_power) {
        if (min_binding_power === void 0) { min_binding_power = 0; }
        var left_node = this.nud();
        while (!this.isEOF()) {
            if (!left_node)
                return null;
            var op_token = this.peek();
            if (!(0, YHelpers_1.isOperator)(op_token)) {
                return left_node;
            }
            var bp = (0, YHelpers_1.getBindingPower)(op_token.type);
            if (!bp)
                break;
            var left_binding_power = bp[0];
            if (left_binding_power < min_binding_power)
                break;
            this.consume(); //consume the operator
            left_node = this.led(op_token, left_node, bp);
        }
        return left_node;
    };
    return YParser;
}());
exports.YParser = YParser;
