import { keywords, TokenType, YASLToken } from "@/yasl/YASLToken";

export interface LexerError {
    message: string;
    line: number;
    column: number;
    source: string;
}

export class Lexer {
    private LineMap: number[] = [];
    private tokens_list       = Array<YASLToken>();
    private curr_line         = 0;
    private curr_col          = 0;
    private curr_read_index   = 0;
    private start_read_index  = 0;
    private next_read_index   = 0;
    private whitespace_regex  = /\s/;
    private is_analysis_complete = false;

    constructor(private text: string, private tokenise_whitespaces = false) {}

    getTokens(): YASLToken[] {
        while (!this.isEOF()) {
            this.start_read_index = this.next_read_index;
            this.scanToken();
        }
        if (!this.is_analysis_complete) {
            this.start_read_index = this.next_read_index;
            this.is_analysis_complete = true;
            this.addToken(TokenType.EOF);
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
                this.addToken(TokenType.STATEMENT_END, null);
                this.LineMap.push(this.curr_read_index);
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
                this.addToken(c as TokenType);
                break;
            case ":":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.INLINE_ASSIGN);
                } else
                    this.addToken(TokenType.COLON);
                break;
            case "=":
                if (this.peek() == "=") {
                    this.consume();
                    this.addToken(TokenType.EQUAL_EQUAL);
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
                    this.addToken(TokenType.NOT_EQUAL);
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
                        while (!this.isEOF()) {
                            if (this.peek() !== "\n")
                                this.consume();
                            else break;
                        }

                        this.addToken(TokenType.COMMENT);
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

            case " ":
            case "\t":
                if (this.tokenise_whitespaces)
                    this.addToken(TokenType.WHITESPACE);
                break;
            default:
                this.reportError("Invalid token", c);
                break;
        }


    }

    isEOF() {
        return this.next_read_index >= this.text.length;
    }

    getLineMap(): number[] {
        return this.LineMap;
    }

    private peek() {
        return this.isEOF() ? "\0" : this.text[this.next_read_index];
    }

    private reportError(msg: string, token_value: string | null = null) {


        const error: LexerError = {
            column : this.curr_col,
            line   : this.curr_line,
            message: msg,
            source : token_value ? token_value : this.text.slice(this.start_read_index, this.next_read_index)
        };

        this.addToken(TokenType.ERROR, error);

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
        this.curr_read_index++;
        this.curr_col++;
        return c;
    }

    private addToken(type: TokenType, obj: Object | null = null) {
        const lexeme = this.text.slice(this.start_read_index, this.next_read_index);
        this.tokens_list.push({
            type  : type,
            lexeme: lexeme,
            literal: obj,
            start : this.start_read_index,
            end   : this.next_read_index
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
        if (keywords.has(identifier)) {

            switch (identifier) {
                case "true":
                    this.addToken(TokenType.TRUE, true);
                    break;
                case "false":
                    this.addToken(TokenType.FALSE, false);
                    break;
                case "null":
                    this.addToken(TokenType.NULL, null);
                    break;
                default:
                    this.addToken(identifier as TokenType, identifier);
                    break;
            }

        } else
            this.addToken(TokenType.IDENTIFIER, identifier);

    }

    private consume_number(start_number: string): void {
        let has_decimal        = false;
        let num_str            = start_number;
        let prev_char          = "";
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
                prev_char   = c;
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
                this.addToken(TokenType.NUMBER, value);
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
            if (c == "\0") {
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
        this.addToken(TokenType.STRING, str);
    }
}

const lexer = new Lexer(`//Test for text highlight
let x = 1000;
let y = "hello world"
print(x,y)

if(x > 100){
    print("x above hundred")
}
switch(y){
    case 1:
        while((let x:=2)){
            someFunction(x)
            x++;
        }
        break
    default:
        break
}
            `, true);
console.log(lexer.getTokens());
