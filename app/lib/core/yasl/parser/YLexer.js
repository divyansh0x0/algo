"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YLexer = void 0;
var LineMap_1 = require("../../LineMap");
var YToken_1 = require("../YToken");
var YLexer = /** @class */ (function () {
    function YLexer(text, tokenise_whitespaces) {
        if (tokenise_whitespaces === void 0) { tokenise_whitespaces = false; }
        this.text = text;
        this.tokenise_whitespaces = tokenise_whitespaces;
        this.lineMap = new LineMap_1.LineMap();
        this.tokens_list = Array();
        this.curr_line = 0;
        this.curr_col = 0;
        this.curr_read_index = 0;
        this.start_read_index = 0;
        this.next_read_index = 0;
        this.whitespace_regex = /\s/;
        this.is_analysis_complete = false;
    }
    YLexer.prototype.getTokens = function () {
        while (!this.isEOF()) {
            this.start_read_index = this.next_read_index;
            this.scanToken();
        }
        if (!this.is_analysis_complete) {
            this.start_read_index = this.next_read_index;
            this.is_analysis_complete = true;
        }
        return this.tokens_list;
    };
    YLexer.prototype.scanToken = function () {
        var c = this.consume();
        if (c.match(/[a-zA-Z_]/)) {
            this.consume_identifier(c);
            return;
        }
        if (c.match(/[0-9]/)) {
            this.consume_number(c);
            return;
        }
        switch (c) {
            case ";":
            case "\n":
                this.addToken(YToken_1.YTokenType.STATEMENT_END, null);
                this.lineMap.push(this.curr_read_index);
                break;
            case "(":
            case ")":
            case "[":
            case "]":
            case "{":
            case "}":
            case ".":
            case ",":
            case "&":
            case "|":
            case "^":
            case "~":
                this.addToken(c);
                break;
            case ":":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.INLINE_ASSIGN);
                }
                else
                    this.addToken(YToken_1.YTokenType.COLON);
                break;
            case "=":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.EQUAL_EQUAL);
                }
                else {
                    this.addToken(YToken_1.YTokenType.ASSIGN);
                }
                break;
            case "<":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.LESS_THAN_EQUAL_TO);
                }
                else if (this.peek() == "<") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.BIT_SHIFT_LEFT);
                }
                else {
                    this.addToken(YToken_1.YTokenType.LESS_THAN);
                }
                break;
            case ">":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.GREATER_THAN_EQUAL_TO);
                }
                else if (this.peek() == ">") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.BIT_SHIFT_RIGHT);
                }
                else {
                    this.addToken(YToken_1.YTokenType.GREATER_THAN);
                }
                break;
            case "!":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.NOT_EQUAL);
                }
                else {
                    this.addToken(YToken_1.YTokenType.NEGATE);
                }
                break;
            case "+":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.PLUS_ASSIGN);
                }
                else if (this.peek() == "+") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.INCREMENT);
                }
                else
                    this.addToken(YToken_1.YTokenType.PLUS);
                break;
            case "-":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.MINUS_ASSIGN);
                }
                else if (this.peek() == "-") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.DECREMENT);
                }
                else
                    this.addToken(YToken_1.YTokenType.MINUS);
                break;
            case "*":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.MULTIPLY_ASSIGN);
                }
                else if (this.peek() == "*") {
                    this.consume();
                    if (this.peek() == "=") {
                        this.consume();
                        this.addToken(YToken_1.YTokenType.POW_ASSIGN);
                    }
                    else
                        this.addToken(YToken_1.YTokenType.POWER);
                }
                else
                    this.addToken(YToken_1.YTokenType.MULTIPLY);
                break;
            case "%":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YToken_1.YTokenType.MOD_ASSIGN);
                }
                else
                    this.addToken(YToken_1.YTokenType.MODULO);
                break;
            case "/":
                switch (this.peek()) {
                    case "/": // skipping a comment
                        this.consume();
                        while (!this.isEOF()) {
                            if (this.peek() !== "\n")
                                this.consume();
                            else
                                break;
                        }
                        this.addToken(YToken_1.YTokenType.COMMENT);
                        break;
                    case "=":
                        this.consume();
                        this.addToken(YToken_1.YTokenType.DIVIDE_ASSIGN);
                        break;
                    default:
                        this.addToken(YToken_1.YTokenType.DIVIDE);
                }
                break;
            case "\"":
            case "'":
                this.consume_string(c);
                break;
            case " ":
            case "\t":
                if (this.tokenise_whitespaces)
                    this.addToken(YToken_1.YTokenType.WHITESPACE);
                break;
            default:
                this.reportError("Invalid token", c);
                break;
        }
    };
    YLexer.prototype.isEOF = function () {
        return this.next_read_index >= this.text.length;
    };
    YLexer.prototype.getLineMap = function () {
        return this.lineMap;
    };
    YLexer.prototype.peek = function () {
        return this.isEOF() ? "" : this.text[this.next_read_index];
    };
    YLexer.prototype.reportError = function (msg, token_value) {
        if (token_value === void 0) { token_value = null; }
        var error = {
            column: this.curr_col,
            line: this.curr_line,
            message: msg,
            source: token_value ? token_value : this.text.slice(this.start_read_index, this.next_read_index)
        };
        this.addToken(YToken_1.YTokenType.ERROR, error);
    };
    YLexer.prototype.consume = function () {
        var c = this.text[this.next_read_index];
        // subtract 2, because I want the index before current index, that is twice before next index
        if (c === "\n") {
            this.curr_line++;
            this.curr_col = 0;
        }
        this.next_read_index++;
        this.curr_read_index++;
        this.curr_col++;
        return c;
    };
    YLexer.prototype.addToken = function (type, obj) {
        if (obj === void 0) { obj = null; }
        var lexeme = this.text.slice(this.start_read_index, this.next_read_index);
        this.tokens_list.push({
            type: type,
            lexeme: lexeme,
            literal: obj,
            start: this.start_read_index,
            end: this.next_read_index
        });
    };
    YLexer.prototype.consume_identifier = function (start_letter) {
        var identifier = start_letter;
        while (!this.isEOF()) {
            var c = this.peek();
            if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9") || c == "_") {
                identifier += c;
            }
            else {
                break;
            }
            this.consume();
        }
        if (YToken_1.YKeywords.has(identifier)) {
            switch (identifier) {
                case "true":
                    this.addToken(YToken_1.YTokenType.TRUE, true);
                    break;
                case "false":
                    this.addToken(YToken_1.YTokenType.FALSE, false);
                    break;
                case "null":
                    this.addToken(YToken_1.YTokenType.NULL, null);
                    break;
                default:
                    this.addToken(identifier, identifier);
                    break;
            }
        }
        else
            this.addToken(YToken_1.YTokenType.IDENTIFIER, identifier);
    };
    YLexer.prototype.consume_number = function (start_number) {
        var has_decimal = false;
        var num_str = start_number;
        var prev_char = "";
        var invalid_underscore = false;
        while (!this.isEOF()) {
            var c = this.peek();
            if ("0" <= c && c <= "9") {
                this.consume();
                num_str += c;
                prev_char = c;
            }
            else if (c === "_") {
                if (prev_char === "_" || prev_char === ".") {
                    invalid_underscore = true;
                }
                this.consume();
                prev_char = c;
            }
            else if (c === "." && !has_decimal) {
                if (prev_char === "_" || this.peek() === "_") { // underscore around decimal are invalid
                    invalid_underscore = true;
                }
                this.consume();
                has_decimal = true;
                num_str += ".";
                prev_char = c;
            }
            else {
                break;
            }
        }
        if (prev_char === "_") // underscore at the end of a number is in valid
            invalid_underscore = true;
        if (invalid_underscore) {
            this.reportError("Invalid underscore placement in number");
        }
        else {
            var value = has_decimal ? parseFloat(num_str) : parseInt(num_str);
            if (!Number.isFinite(value) || Number.isNaN(value))
                this.reportError("Numeric overflow", num_str);
            else
                this.addToken(YToken_1.YTokenType.NUMBER, value);
        }
    };
    YLexer.prototype.consume_string = function (start_symbol) {
        var str = "";
        while (!this.isEOF()) {
            var c = this.consume();
            if (c === start_symbol)
                break;
            if (c == "\n") {
                this.reportError("Invalid newline in single line string", str);
                return;
            }
            if (this.isEOF()) {
                this.reportError("Reached end of file after", str);
                return;
            }
            if (c === "\\") {
                var next = this.consume();
                switch (next) {
                    case "\"":
                        str += "\"";
                        break;
                    case "'":
                        str += "'";
                        break;
                    case "n":
                        str += "\n"; //appends newline
                        break;
                    case "t":
                        str += "\t"; //appends tab
                        break;
                    case "r":
                        str += "\r"; // appends carriage return
                        break;
                    case "\\":
                        str += "\\"; // appends a backslash \
                        break;
                }
            }
            else
                str += c;
        }
        this.addToken(YToken_1.YTokenType.STRING, str);
    };
    return YLexer;
}());
exports.YLexer = YLexer;
