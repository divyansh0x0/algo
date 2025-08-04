import { YASLNode, YASLNodeType } from "@/yasl/tree";

enum Colors {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    FgGray = "\x1b[90m",

    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m",
    BgGray = "\x1b[100m",
}

export class formatter {


    static formatAstJSON(node: YASLNode): string {
        function isIterable(obj: any): obj is Iterable<any> {
            return obj != null && typeof obj[Symbol.iterator] === "function";
        }

        function serialize(node: YASLNode): any {
            const result: any = { type: formatter.formatNodeType(node.type) };

            const entries = Object.entries(node);
            for (const [ key, value ] of entries) {
                if (key === "type" || key === "next_node") continue;

                if (value && typeof value === "object") {
                    if ("type" in value) {
                        result[key] = serialize(value as YASLNode);
                    } else if ("lexeme" in value) {
                        result[key] = value.lexeme;
                    } else if (isIterable(value)) {
                        result[key] = [];
                        for (const item of value) {
                            if (item && typeof item === "object" && "type" in item) {
                                result[key].push(serialize(item));
                            } else {
                                result[key].push(item);
                            }
                        }
                    } else {
                        result[key] = "[unknown object]";
                    }
                } else {
                    result[key] = value;
                }
            }

            if (node.next_node) {
                result.next_node = serialize(node.next_node);
            }

            return result;
        }

        return JSON.stringify(serialize(node));
    }


    static formatAst(node: YASLNode, indentLevel = 0): string {
        const lines: string[] = [];

        function isIterable(obj: any): obj is Iterable<any> {
            return obj != null && typeof obj[Symbol.iterator] === "function";
        }

        function render(node: YASLNode, indentLevel: number, prefixStr = "") {
            const indent = "  ".repeat(indentLevel);
            const branch = prefixStr ? `${ prefixStr }└──` : "";

            if (indentLevel === 0) {
                lines.push(`${ branch }[${ Colors.FgGreen }${ formatter.formatNodeType(node.type) }${ Colors.Reset }]`);
            }

            const entries = Object.entries(node);
            for (const [ key, value ] of entries) {
                if (key === "type" || key === "next_node") continue;

                const label = `${ Colors.FgBlue }${ key }${ Colors.Reset }`;
                const newPrefix = prefixStr + "  ";

                if (value && typeof value === "object") {
                    if ("type" in value) {
                        // Child node
                        lines.push(`${ newPrefix }├── ${ label }: [${ Colors.FgMagenta }${ formatter.formatNodeType(value.type) }${ Colors.Reset }]`);
                        render(value as YASLNode, indentLevel + 1, newPrefix + "│ ");
                    } else if ("lexeme" in value) {
                        lines.push(`${ newPrefix }├── ${ label }: ${ value.lexeme }`);
                    } else if (isIterable(value)) {
                        lines.push(`${ newPrefix }├── ${ label }: [`);
                        for (const item of value) {
                            if (item && typeof item === "object" && "type" in item) {
                                lines.push(`${ newPrefix }│   ├── [${ Colors.FgMagenta }${ formatter.formatNodeType(item.type) }${ Colors.Reset }]`);
                                const rendered = formatter.formatAst(item, indentLevel + 2);
                                for (const l of rendered.split("\n")) {
                                    lines.push(`${ newPrefix }│   │ ${ l }`);
                                }
                            } else {
                                lines.push(`${ newPrefix }│   ├── ${ JSON.stringify(item) }`);
                            }
                        }
                        lines.push(`${ newPrefix }│   ]`);
                    } else {
                        lines.push(`${ newPrefix }├── ${ label }: [unknown object]`);
                    }
                } else {
                    lines.push(`${ newPrefix }├── ${ label }: ${ value }`);
                }
            }

            if (node.next_node) {
                lines.push(`${ prefixStr }${ "=".repeat(40) } next_node ${ "=".repeat(40) }`);
                render(node.next_node, indentLevel, prefixStr);
            }
        }

        render(node, indentLevel);
        return lines.join("\n");
    }


    static formatNodeType(type: YASLNodeType): string {
        switch (type) {
            case YASLNodeType.IDENTIFIER:
                return "Identifier";
            case YASLNodeType.LITERAL:
                return "Literal";
            case YASLNodeType.CALL:
                return "Call";
            case YASLNodeType.BREAK_STATEMENT:
                return "Break Statement";
            case YASLNodeType.CONTINUE_STATEMENT:
                return "Continue Statement";
            case YASLNodeType.DECLARATION_STATEMENT:
                return "Declaration Statement";
            case YASLNodeType.ASSIGNMENT:
                return "Assignment Expression";
            case YASLNodeType.FUNCTION_DEFINITION:
                return "Function Definition";
            case YASLNodeType.RETURN_STATEMENT:
                return "Return Statement";
            case YASLNodeType.FOR_STATEMENT:
                return "For Statement";
            case YASLNodeType.WHILE_STATEMENT:
                return "While Statement";
            case YASLNodeType.THEN_STATEMENT:
                return "Then Statement";
            case YASLNodeType.IF_STATEMENT:
                return "If Statement";
            case YASLNodeType.ELSE_STATEMENT:
                return "Else Statement";
            case YASLNodeType.ELSE_IF_STATEMENT:
                return "Else If Statement";
            case YASLNodeType.SWITCH_STATEMENT:
                return "Switch Statement";
            case YASLNodeType.SWITCH_CASE_STATEMENT:
                return "Switch Case Statement";
            case YASLNodeType.BINARY_EXPRESSION:
                return "Binary Expression";
            case YASLNodeType.UNARY_EXPRESSION:
                return "Unary Expression";
            case YASLNodeType.BLOCK_STATEMENT:
                return "Block Statement";
            case YASLNodeType.TERNARY_EXPRESSION:
                return "Ternary Expression";
            case  YASLNodeType.PROPERTY_ACCESS:
                return "Property Access";
            case YASLNodeType.POSTFIX_OPERATION:
                return "Postfix Operation";
            default:
                return "Unknown YASLNode Type (" + YASLNodeType + ")";
        }
    }

}
