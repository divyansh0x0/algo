import { YNodeType } from "./YAst";
import type { YNode } from "./YNode";

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

export class YFormatter {


    static formatAstJSON(node: YNode): string {
        function isIterable(obj: any): obj is Iterable<any> {
            return obj != null && typeof obj[Symbol.iterator] === "function";
        }

        function serialize(node: YNode): any {
            const result: any = {type: YFormatter.formatNodeType(node.type)};

            const entries = Object.entries(node);
            for (const [ key, value ] of entries) {
                if (key === "type" || key === "next_node") continue;

                if (value && typeof value === "object") {
                    if ("type" in value) {
                        result[key] = serialize(value as YNode);
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


    static formatAst(node: YNode, indentLevel = 0): string {
        const lines: string[] = [];

        function isIterable(obj: any): obj is Iterable<any> {
            return obj != null && typeof obj[Symbol.iterator] === "function";
        }

        function render(node: YNode, indentLevel: number, prefixStr = "") {
            const branch = prefixStr ? `${prefixStr}└──` : "";

            if (indentLevel === 0) {
                lines.push(`${branch}[${Colors.FgGreen}${YFormatter.formatNodeType(node.type)}${Colors.Reset}]`);
            }

            const entries = Object.entries(node);
            for (const [ key, value ] of entries) {
                if (key === "type" || key === "next_node") continue;

                const label = `${Colors.FgBlue}${key}${Colors.Reset}`;
                const newPrefix = prefixStr + "  ";

                if (value && typeof value === "object") {
                    if ("type" in value) {
                        // Child node
                        lines.push(`${newPrefix}├── ${label}: [${Colors.FgMagenta}${YFormatter.formatNodeType(value.type)}${Colors.Reset}]`);
                        render(value as YNode, indentLevel + 1, newPrefix + "│ ");
                    } else if ("lexeme" in value) {
                        lines.push(`${newPrefix}├── ${label}: ${value.lexeme}`);
                    } else if (isIterable(value)) {
                        lines.push(`${newPrefix}├── ${label}: [`);
                        for (const item of value) {
                            if (item && typeof item === "object" && "type" in item) {
                                lines.push(`${newPrefix}│   ├── [${Colors.FgMagenta}${YFormatter.formatNodeType(item.type)}${Colors.Reset}]`);
                                const rendered = YFormatter.formatAst(item, indentLevel + 2);
                                for (const l of rendered.split("\n")) {
                                    lines.push(`${newPrefix}│   │ ${l}`);
                                }
                            } else {
                                lines.push(`${newPrefix}│   ├── ${JSON.stringify(item)}`);
                            }
                        }
                        lines.push(`${newPrefix}│   ]`);
                    } else {
                        lines.push(`${newPrefix}├── ${label}: [unknown object]`);
                    }
                } else {
                    lines.push(`${newPrefix}├── ${label}: ${value}`);
                }
            }

            if (node.next_node) {
                lines.push(`${prefixStr}${"=".repeat(40)} next_node ${"=".repeat(40)}`);
                render(node.next_node, indentLevel, prefixStr);
            }
        }

        render(node, indentLevel);
        return lines.join("\n");
    }


    static formatNodeType(type: YNodeType): string {
        switch (type) {
            case YNodeType.IDENTIFIER:
                return "Identifier";
            case YNodeType.LITERAL:
                return "Literal";
            case YNodeType.CALL:
                return "Call";
            case YNodeType.BREAK_STATEMENT:
                return "Break Statement";
            case YNodeType.CONTINUE_STATEMENT:
                return "Continue Statement";
            case YNodeType.DECLARATION_STATEMENT:
                return "Declaration Statement";
            case YNodeType.ASSIGNMENT:
                return "Assignment Expression";
            case YNodeType.FUNCTION_DEFINITION:
                return "Function Definition";
            case YNodeType.RETURN_STATEMENT:
                return "Return Statement";
            case YNodeType.FOR_STATEMENT:
                return "For Statement";
            case YNodeType.WHILE_STATEMENT:
                return "While Statement";
            case YNodeType.THEN_STATEMENT:
                return "Then Statement";
            case YNodeType.IF_STATEMENT:
                return "If Statement";
            case YNodeType.ELSE_STATEMENT:
                return "Else Statement";
            case YNodeType.ELSE_IF_STATEMENT:
                return "Else If Statement";
            case YNodeType.SWITCH_STATEMENT:
                return "Switch Statement";
            case YNodeType.SWITCH_CASE_STATEMENT:
                return "Switch Case Statement";
            case YNodeType.BINARY_EXPRESSION:
                return "Binary Expression";
            case YNodeType.UNARY_EXPRESSION:
                return "Unary Expression";
            case YNodeType.BLOCK_STATEMENT:
                return "Block Statement";
            case YNodeType.TERNARY_EXPRESSION:
                return "Ternary Expression";
            case  YNodeType.PROPERTY_ACCESS:
                return "Property Access";
            case YNodeType.POSTFIX_OPERATION:
                return "Postfix Operation";
            case YNodeType.ARRAY:
                return "Array";
            case YNodeType.IndexingOperation:
                return "Indexing Operation";
            default:
                return "Unknown Node Type (" + YNodeType + ")";
        }
    }

}
