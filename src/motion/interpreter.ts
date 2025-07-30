import { Ast } from "@/motion/ast/tree";
import { Environment } from "@/motion/environment";
import { Lexer } from "@/motion/lexer";
import { Parser } from "@/motion/parser";

class Interpreter {
    private next_node: Ast.Node | null;
    private current_scope = new Environment();

    constructor(private ast: Ast.Node) {
        this.next_node = ast;
    }

    runAll() {
        while (!this.isEnd()) {
            const node = this.consumeNode();
            if (!node)
                break;
            this.parseNode(node);
        }
    }

    isEnd() {
        return this.next_node === null;
    }

    parseNode(node: Ast.Node) {
        switch (node.type) {
            case Ast.NodeType.ASSIGNMENT_EXPRESSION: {
                this.parseAssignment(node as Ast.AssignmentExpression);
            }
        }
    }

    parseAssignment(node: Ast.AssignmentExpression) {
        const lvalue = node.lvalue;
        const rvalue = node.rvalue;
        if (Ast.isIdentifier(lvalue)) {
            this.current_scope.define(lvalue.name, rvalue);
        } else if (Ast.isPropertyAccess(lvalue)) {
            this.current_scope.defineScope(lvalue.parent_node, rvalue);
        }
    }

    parsePropertyAccess(node: Ast.PropertyAccessExpression): Ast.IdentifierNode {

    }

    consumeNode() {
        const curr_node = this.next_node;
        if (curr_node)
            this.next_node = curr_node?.next_node;
        return curr_node;
    }


}

const lexer = new Lexer("");
const tokens = lexer.getTokens();
const parser = new Parser(tokens);


const ast = parser.getAst();

if (ast) {
    const interpreter = new Interpreter(ast);
    interpreter.runAll();
} else {
    for (const error of parser.errors) {
        console.error(error);
    }
}
