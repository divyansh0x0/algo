import { keywords, Token, TokenType } from "@/motion/tokens/token";

export interface LexerError {
    message: string;
    line: number;
    column: number;
    highlight: string;
}

export class Lexer {
    private tokens_list = Array<Token>();
    private curr_line = 0;
    private curr_col = 0;
    private start_read_index = 0;
    private next_read_index = 0;
    private end_of_literal_regex = /[\s\n(){},.:;+/*%&|^<=>!\-\[\]]/;
    private whitespace_regex = /\s/;
    private is_analysis_complete = false;

    constructor(private text: string) {}

    private _errors = Array<LexerError>();

    get errors() {
        return this._errors;
    }

    getTokens(): Token[] {
        while (!this.isEOF()) {
            this.start_read_index = this.next_read_index;
            this.scanToken();
        }
        if (!this.is_analysis_complete) {
            this.is_analysis_complete = true;
            this.addToken(TokenType.EOF);
        }
        return this.tokens_list;
    }

    getLastToken() {
        return this.tokens_list[this.tokens_list.length - 1];
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
                this.addToken(TokenType.STATEMENT_END, null);
                break;
            case "\t":
            case " ":
            case "\r":
                break;

            case "(":
            case ")":
            case "[":
            case "]":
            case "{":
            case "}":
            case ".":
            case ",":
            case ":":
            case "&":
            case "|":
            case "^":
            case "~":
                this.addToken(c as TokenType);
                break;
            case "=":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.EQUAL_TO);
                } else {
                    this.addToken(TokenType.ASSIGN);
                }
                break;
            case "<":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.LESS_THAN_EQUAL_TO);
                } else if (this.peek() == "<") {
                    this.consume();
                    this.addToken(TokenType.BIT_SHIFT_LEFT);
                } else {
                    this.addToken(TokenType.LESS_THAN);
                }
                break;
            case ">":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.GREATER_THAN_EQUAL_TO);
                } else if (this.peek() == ">") {
                    this.consume();
                    this.addToken(TokenType.BIT_SHIFT_RIGHT);
                } else {
                    this.addToken(TokenType.GREATER_THAN);
                }
                break;
            case "!":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.NOT_EQUAL_TO);
                } else {
                    this.addToken(TokenType.NEGATE);
                }
                break;
            case "+":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.PLUS_ASSIGN);
                } else if (this.peek() == "+") {
                    this.consume();
                    this.addToken(TokenType.INCREMENT);
                } else
                    this.addToken(TokenType.PLUS);
                break;
            case "-":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.MINUS_ASSIGN);
                } else if (this.peek() == "-") {
                    this.consume();
                    this.addToken(TokenType.DECREMENT);
                } else
                    this.addToken(TokenType.MINUS);
                break;
            case "*":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.MULTIPLY_ASSIGN);
                } else if (this.peek() == "*") {
                    this.consume();
                    if (this.peek() == "=") {
                        this.consume();
                        this.addToken(TokenType.POW_ASSIGN);
                    } else
                        this.addToken(TokenType.POWER);
                } else
                    this.addToken(TokenType.MULTIPLY);
                break;

            case "%":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.MOD_ASSIGN);
                } else
                    this.addToken(TokenType.MODULO);
                break;
            case "/":
                switch (this.peek()) {
                    case "/":// skipping a comment
                        this.consume();
                        while (!this.isEOF() && this.peek() !== "\n") this.consume();
                        break;
                    case "=":
                        this.consume();
                        this.addToken(TokenType.DIVIDE_ASSIGN);
                        break;
                    default:
                        this.addToken(TokenType.DIVIDE);

                }
                break;
            case "\"":
            case "\'":
                this.consume_string(c);
                break;
            default:
                this.error(`Invalid token "${ c }"`);
                break;
        }


    }

    isEOF() {
        return this.text.length - 1 < this.next_read_index;
    }

    private error(msg: string) {
        this._errors.push(
            {
                column: this.curr_col,
                highlight: this.getCurrentColumnHighlighted(),
                line: this.curr_line,
                message: msg
            });
    }

    private getCurrentColumnHighlighted(): string {
        let curr_index = this.next_read_index - 1;
        let line_start = this.text.lastIndexOf("\n", curr_index) + 1;
        let line_end = this.text.indexOf("\n", curr_index);
        if (line_end === -1) line_end = this.text.length;

        const original_line = this.text.slice(line_start, line_end);
        const col_pos = this.next_read_index - 1 - line_start;


        const display_line = original_line.trim();
        const trimmed_amount = original_line.length - original_line.trimStart().length;
        const adjusted_col_pos = col_pos - trimmed_amount;

        const position_highlight_str = " ".repeat(adjusted_col_pos) + "^";
        return display_line + "\n" + position_highlight_str;
    }

    private peek() {
        return this.isEOF() ? "\0" : this.text[this.next_read_index];
    }


    private consume(): string {
        if (this.isEOF())
            return "\0";
        const c = this.text[this.next_read_index];
        // subtract 2, because I want the index before current index, that is twice before next index
        if (c === "\n") {
            this.curr_line++;
            this.curr_col = 0;
        }
        this.next_read_index++;
        this.curr_col++;
        return c;
    }

    private addToken(type: TokenType, obj: Object | null = null) {
        const lexeme = this.text.slice(this.start_read_index, this.next_read_index);
        this.tokens_list.push({
            type: type,
            lexeme: lexeme,
            literal: obj,
            col: this.curr_col,
            line: this.curr_line
        });
    }

    private consume_identifier(start_letter: string): void {
        const regex = /[a-zA-Z0-9_]/;
        let identifier = start_letter;
        while (!this.isEOF()) {
            const c = this.peek();
            if (c.match(this.end_of_literal_regex))
                break;
            if (c.match(regex)) {
                identifier += c;
            } else {
                this.error(`"${ c }" is an invalid character used for identifier`);
                this.consume();
                break;
            }
            this.consume();
        }
        if (keywords.has(identifier)) {
            if (identifier === "true")
                this.addToken(TokenType.TRUE, true);
            else if (identifier === "false")
                this.addToken(TokenType.FALSE, false);
            else if (identifier === "null")
                this.addToken(TokenType.NULL, null);
            else
                this.addToken(identifier as TokenType, identifier);

        } else
            this.addToken(TokenType.IDENTIFIER, identifier);

    }


    private consume_number(start_number: string): void {
        const regex = /[0-9_]/;
        let has_decimal = false;
        let num_str = start_number;
        let c = start_number;
        let is_error = false;
        while (!this.isEOF()) {
            c = this.peek();

            if (c.match(this.end_of_literal_regex))
                if ((c === "." && has_decimal) || c !== ".")
                    break;
            if (is_error) {
                this.consume();
                continue;
            }
            if (c.match(regex)) {
                if (c !== "_")
                    num_str += c;
            } else if (c == "." && !has_decimal) {
                has_decimal = true;
                num_str += c;
            } else {
                if (c.match(/[a-zA-Z]/))
                    this.error("Identifiers cannot begin with a number");
                else
                    this.error(`Invalid character used for a number: "${ c }"`);
            }
            this.consume();
        }

        if (!is_error)
            this.addToken(TokenType.NUMBER, parseInt(num_str));
    }

    private consume_string(start_symbol: "\"" | "\'"): void {
        let str = "";
        while (!this.isEOF()) {
            const c = this.consume();
            if (c === start_symbol)
                break;
            if (c == "\n") {
                this.error(`Invalid newline in single line string after ${ str }`);
                return;
            }
            if (c == "\0") {
                this.error(`Reached end of file after ${ str }`);
                return;
            }

            if (c === "\\") {
                const next = this.consume();
                switch (next) {
                    case "n":
                        str += "\n"; //appends newline
                        break;
                    case "t":
                        str += "\t"; //appends tab
                        break;
                    case "\r":
                        str += "\r"; // appends carriage return
                        break;
                    case "\\":
                        str += "\\"; // appends a backslash \
                        break;
                    case "'":
                        str += "'"; //appends '
                        break;

                }
            } else
                str += c;
        }
    }

}
