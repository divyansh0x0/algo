import { Ast } from "@/motion/ast/tree";

export namespace formatter {


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

    export function formatAstJSON(node: Ast.Node): string {
        function isIterable(obj: any) {
            return obj != null && typeof obj[Symbol.iterator] === "function";
        }

        function serialize(node: Ast.Node): any {
            const result: any = { type: formatNodeType(node.type) };

            const entries = Object.entries(node);
            for (const [ key, value ] of entries) {
                if (key === "node_type" || key === "next_node") continue;

                if (value && typeof value === "object") {
                    if ("node_type" in value) {
                        result[key] = serialize(value as Ast.Node);
                    } else if ("lexeme" in value) {
                        result[key] = value.lexeme;
                    } else if (isIterable(value)) {
                        result[key] = [];
                        for (const item of value) {
                            if (item && typeof item === "object" && "node_type" in item) {
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


    export function formatAst(node: Ast.Node, indentLevel = 0): string {
        const lines: string[] = [];

        function isIterable(obj: any) {
            return obj != null && typeof obj[Symbol.iterator] === "function";
        }

        function render(node: Ast.Node, indentLevel: number, prefixStr = "") {
            const indent = "  ".repeat(indentLevel);
            const branch = prefixStr ? `${ prefixStr }└──` : "";

            if (indentLevel === 0) {
                lines.push(`${ branch }[${ Colors.FgGreen }${ formatNodeType(node.type) }${ Colors.Reset }]`);
            }

            const entries = Object.entries(node);
            for (const [ key, value ] of entries) {
                if (key === "node_type" || key === "next_node") continue;

                const label = `${ Colors.FgBlue }${ key }${ Colors.Reset }`;
                const newPrefix = prefixStr + "  ";

                if (value && typeof value === "object") {
                    if ("node_type" in value) {
                        // Child node
                        lines.push(`${ newPrefix }├── ${ label }: [${ Colors.FgMagenta }${ formatNodeType(value.node_type) }${ Colors.Reset }]`);
                        render(value as Ast.Node, indentLevel + 1, newPrefix + "│ ");
                    } else if ("lexeme" in value) {
                        lines.push(`${ newPrefix }├── ${ label }: ${ value.lexeme }`);
                    } else if (isIterable(value)) {
                        lines.push(`${ newPrefix }├── ${ label }: [`);
                        for (const item of value) {
                            if (item && typeof item === "object" && "node_type" in item) {
                                lines.push(`${ newPrefix }│   ├── [${ Colors.FgMagenta }${ formatNodeType(item.node_type) }${ Colors.Reset }]`);
                                const rendered = formatAst(item, indentLevel + 2);
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


    export function formatNodeType(node_type: Ast.NodeType): string {
        switch (node_type) {
            case Ast.NodeType.IDENTIFIER:
                return "Identifier";
            case Ast.NodeType.LITERAL:
                return "Literal";
            case Ast.NodeType.CALL:
                return "Call";
            case Ast.NodeType.BREAK_STATEMENT:
                return "Break Statement";
            case Ast.NodeType.CONTINUE_STATEMENT:
                return "Continue Statement";
            case Ast.NodeType.DECLARATION_STATEMENT:
                return "Declaration Statement";
            case Ast.NodeType.ASSIGNMENT_EXPRESSION:
                return "Assignment Expression";
            case Ast.NodeType.FUNCTION_DEFINITION:
                return "Function Definition";
            case Ast.NodeType.RETURN_STATEMENT:
                return "Return Statement";
            case Ast.NodeType.FOR_STATEMENT:
                return "For Statement";
            case Ast.NodeType.WHILE_STATEMENT:
                return "While Statement";
            case Ast.NodeType.THEN_STATEMENT:
                return "Then Statement";
            case Ast.NodeType.IF_STATEMENT:
                return "If Statement";
            case Ast.NodeType.ELSE_STATEMENT:
                return "Else Statement";
            case Ast.NodeType.ELSE_IF_STATEMENT:
                return "Else If Statement";
            case Ast.NodeType.SWITCH_STATEMENT:
                return "Switch Statement";
            case Ast.NodeType.SWITCH_CASE_STATEMENT:
                return "Switch Case Statement";
            case Ast.NodeType.BINARY_EXPRESSION:
                return "Binary Expression";
            case Ast.NodeType.UNARY_EXPRESSION:
                return "Unary Expression";
            case Ast.NodeType.BLOCK_STATEMENT:
                return "Block Statement";
            case Ast.NodeType.TERNARY_EXPRESSION:
                return "Ternary Expression";
            case  Ast.NodeType.PROPERTY_ACCESS_EXPRESSION:
                return "Property Access";
            case Ast.NodeType.POSTFIX_OPERATION:
                return "Postfix Operation";
            default:
                return "Unknown Node Type (" + Ast.NodeType + ")";
        }
    }

}
