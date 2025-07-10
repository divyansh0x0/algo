import { Lexer } from "@/algoLang/lexer";
import { Token } from "@/algoLang/Tokens/token";


export function testLexer(input: string, expected: Token[] = []) {
    const lexer = new Lexer(input);
    const actual = lexer.getTokens(); // Your lexer function here
    const pass = actual.length === expected.length &&
        actual.every((token, i) =>
            token.token_type === expected[i].token_type &&
            token.literal === expected[i].literal
        );

    console.log(pass ? "✅ Test passed" : "❌ Test failed");
    // if (!pass) {
    console.log("Expected:", expected);
    console.log("Got     :", actual);
    // }
    for (const error of lexer.errors) {
        console.error(error.message + "\n" + error.highlight);
    }
}


