import { Lexer } from "@/motion/lexer";
import { Parser } from "@/motion/parser";


const tests = {
    "a+b": "",
    // "a=-f(a+b*-c())/(d+-e)+--g[2*h()]()": "",
    "a.b().c++": ""
};

for (const key in tests) {
    const tokens = new Lexer(key).getTokens();
    const parser = new Parser(tokens);
    const ast = parser.getAst();
    const errors = parser.errors;
    if (errors.length > 0) {
        let s = "-".repeat(100) + "\n";
        s += "Errors occurred while parsing: " + key + "\n";
        for (let i = 0; i < errors.length; i++) {
            const error = errors[i];
            s += `\t${ i + 1 }. Error at ${ error.line }:${ error.col } ${ error.token.lexeme }: ${ error.message }\n`;
        }
        s += "-".repeat(100);
        console.log(s);
    }
    console.log(ast);
}
