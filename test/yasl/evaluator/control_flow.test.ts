import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { TracerVisitor } from '../../../app/lib/core/yasl/visitors/TracerVisitor';

describe('Evaluator: Control Flow', () => {
    function evaluateCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        const program = parser.getProgram();
        
        if (parser.getErrors().length > 0) {
            throw new Error('Parser errors: ' + parser.getErrors().map(e => e.message).join(', '));
        }

        const visitor = new TracerVisitor(lexer.getLineMap());
        let lastResult = null;
        for (const stmt of program.getStatements()) {
            lastResult = visitor.visit(stmt);
        }
        return { visitor, lastResult };
    }

    it.todo('should evaluate if / else correctly', () => {
        const { lastResult } = evaluateCode(`
            let result = 0;
            if (true) {
                result = 1;
            } else {
                result = 2;
            }
            result;
        `);
        // Expect result to be 1
    });

    it.todo('should evaluate switch / case correctly', () => {
        const { lastResult } = evaluateCode(`
            let x = 2;
            let result = 0;
            switch(x) {
                case 1:
                    result = 1;
                    break;
                case 2:
                    result = 2;
                    break;
                default:
                    result = -1;
            }
            result;
        `);
        // Expect result to be 2
    });

    it.todo('should evaluate while loops correctly', () => {
        const { lastResult } = evaluateCode(`
            let count = 0;
            while(count < 3) {
                count := count + 1;
            }
            count;
        `);
        // Expect count to be 3
    });

    it.todo('should evaluate for loops correctly', () => {
        const { lastResult } = evaluateCode(`
            let sum = 0;
            for(let i = 0; i < 5; i++) {
                sum := sum + i;
            }
            sum;
        `);
        // Expect sum to be 10
    });
});
