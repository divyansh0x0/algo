import { LineMap } from "../../LineMap";
import { YKeywords, type YToken, YTokenType } from "../YToken";

export interface LexerError {
    message: string;
    line: number;
    column: number;
    source: string;
}

export class YLexer {
    private lineMap: LineMap = new LineMap();
    private tokens_list = Array<YToken>();
    private curr_line = 0;
    private curr_col = 0;
    private curr_read_index = 0;
    private start_read_index = 0;
    private next_read_index = 0;
    private whitespace_regex = /\s/;
    private is_analysis_complete = false;

    constructor(private text: string, private tokenise_whitespaces = false) {
    }

    getTokens(): YToken[] {
        while (!this.isEOF()) {
            this.start_read_index = this.next_read_index;
            this.scanToken();
        }
        if (!this.is_analysis_complete) {
            this.start_read_index = this.next_read_index;
            this.is_analysis_complete = true;
        }
        return this.tokens_list;
    }

    scanToken() {
        const c = this.consume();

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
                this.addToken(YTokenType.STATEMENT_END, null);
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
                this.addToken(c as YTokenType);
                break;
            case ":":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.INLINE_ASSIGN);
                } else
                    this.addToken(YTokenType.COLON);
                break;
            case "=":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.EQUAL_EQUAL);
                } else {
                    this.addToken(YTokenType.ASSIGN);
                }
                break;
            case "<":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.LESS_THAN_EQUAL_TO);
                } else if (this.peek() == "<") {
                    this.consume();
                    this.addToken(YTokenType.BIT_SHIFT_LEFT);
                } else {
                    this.addToken(YTokenType.LESS_THAN);
                }
                break;
            case ">":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.GREATER_THAN_EQUAL_TO);
                } else if (this.peek() == ">") {
                    this.consume();
                    this.addToken(YTokenType.BIT_SHIFT_RIGHT);
                } else {
                    this.addToken(YTokenType.GREATER_THAN);
                }
                break;
            case "!":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.NOT_EQUAL);
                } else {
                    this.addToken(YTokenType.NEGATE);
                }
                break;
            case "+":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.PLUS_ASSIGN);
                } else if (this.peek() == "+") {
                    this.consume();
                    this.addToken(YTokenType.INCREMENT);
                } else
                    this.addToken(YTokenType.PLUS);
                break;
            case "-":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.MINUS_ASSIGN);
                } else if (this.peek() == "-") {
                    this.consume();
                    this.addToken(YTokenType.DECREMENT);
                } else
                    this.addToken(YTokenType.MINUS);
                break;
            case "*":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.MULTIPLY_ASSIGN);
                } else if (this.peek() == "*") {
                    this.consume();
                    if (this.peek() == "=") {
                        this.consume();
                        this.addToken(YTokenType.POW_ASSIGN);
                    } else
                        this.addToken(YTokenType.POWER);
                } else
                    this.addToken(YTokenType.MULTIPLY);
                break;

            case "%":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(YTokenType.MOD_ASSIGN);
                } else
                    this.addToken(YTokenType.MODULO);
                break;
            case "/":
                switch (this.peek()) {
                    case "/":// skipping a comment
                        this.consume();
                        while (!this.isEOF()) {
                            if (this.peek() !== "\n")
                                this.consume();
                            else break;
                        }

                        this.addToken(YTokenType.COMMENT);
                        break;
                    case "=":
                        this.consume();
                        this.addToken(YTokenType.DIVIDE_ASSIGN);
                        break;
                    default:
                        this.addToken(YTokenType.DIVIDE);

                }
                break;
            case "\"":
            case "'":
                this.consume_string(c);
                break;

            case " ":
            case "\t":
                if (this.tokenise_whitespaces)
                    this.addToken(YTokenType.WHITESPACE);
                break;
            default:
                this.reportError("Invalid token", c);
                break;
        }


    }

    isEOF() {
        return this.next_read_index >= this.text.length;
    }

    getLineMap(): LineMap {
        return this.lineMap;
    }

    private peek() {
        return this.isEOF() ? "" : this.text[this.next_read_index]!;
    }

    private reportError(msg: string, token_value: string | null = null) {


        const error: LexerError = {
            column: this.curr_col,
            line: this.curr_line,
            message: msg,
            source: token_value ? token_value : this.text.slice(this.start_read_index, this.next_read_index)
        };

        this.addToken(YTokenType.ERROR, error);

    }

    private consume(): string {
        const c = this.text[this.next_read_index]!;
        // subtract 2, because I want the index before current index, that is twice before next index
        if (c === "\n") {
            this.curr_line++;
            this.curr_col = 0;
        }
        this.next_read_index++;
        this.curr_read_index++;
        this.curr_col++;
        return c;
    }

    private addToken(type: YTokenType, obj: Object | null = null) {
        const lexeme = this.text.slice(this.start_read_index, this.next_read_index);
        this.tokens_list.push({
            type: type,
            lexeme: lexeme,
            literal: obj,
            start: this.start_read_index,
            end: this.next_read_index
        });
    }

    private consume_identifier(start_letter: string): void {
        let identifier = start_letter;
        while (!this.isEOF()) {
            const c = this.peek();
            if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9") || c == "_") {
                identifier += c;
            } else {
                break;
            }
            this.consume();
        }
        if (YKeywords.has(identifier)) {

            switch (identifier) {
                case "true":
                    this.addToken(YTokenType.TRUE, true);
                    break;
                case "false":
                    this.addToken(YTokenType.FALSE, false);
                    break;
                case "null":
                    this.addToken(YTokenType.NULL, null);
                    break;
                default:
                    this.addToken(identifier as YTokenType, identifier);
                    break;
            }

        } else
            this.addToken(YTokenType.IDENTIFIER, identifier);

    }

    private consume_number(start_number: string): void {
        let has_decimal = false;
        let num_str = start_number;
        let prev_char = "";
        let invalid_underscore = false;
        while (!this.isEOF()) {
            const c = this.peek();

            if (/[0-9]/.test(c)) {
                this.consume();
                num_str += c;
                prev_char = c;
            } else if (c === "_") {
                if (prev_char === "_" || prev_char === ".") {
                    invalid_underscore = true;
                }
                this.consume();
                prev_char = c;

            } else if (c === "." && !has_decimal) {
                if (prev_char === "_" || this.peek() === "_") { // underscore around decimal are invalid
                    invalid_underscore = true;
                }
                this.consume();
                has_decimal = true;
                num_str += ".";
                prev_char = c;
            } else {
                break;
            }
        }
        if (prev_char === "_") // underscore at the end of a number is in valid
            invalid_underscore = true;

        if (invalid_underscore) {
            this.reportError("Invalid underscore placement in number");
        } else {
            const value = has_decimal ? parseFloat(num_str) : parseInt(num_str);
            if (!Number.isFinite(value) || Number.isNaN(value))
                this.reportError("Numeric overflow", num_str);
            else
                this.addToken(YTokenType.NUMBER, value);
        }
    }

    private consume_string(start_symbol: "\"" | "\'"): void {
        let str = "";
        while (!this.isEOF()) {
            const c = this.consume();
            if (c === start_symbol)
                break;
            if (c == "\n") {
                this.reportError(`Invalid newline in single line string`, str);
                return;
            }
            if (this.isEOF()) {
                this.reportError(`Reached end of file after`, str);
                return;
            }

            if (c === "\\") {
                const next = this.consume();
                switch (next) {
                    case "\"":
                        str += "\"";
                        break;
                    case "\'":
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
            } else
                str += c;
        }
        this.addToken(YTokenType.STRING, str);
    }
}
