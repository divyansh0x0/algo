import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { TracerVisitor } from '../../../app/lib/core/yasl/visitors/TracerVisitor';

describe('Evaluator: Functions & Methods', () => {
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

    it.todo('should evaluate function declarations and return values', () => {
        const { lastResult } = evaluateCode(`
            fn sum(a, b) {
                return a + b;
            }
            let x = sum(10, 20);
            x;
        `);
        // Expect result to be 30
    });

    it.todo('should evaluate native array methods', () => {
        const { lastResult } = evaluateCode(`
            let arr = [1, 2, 3];
            arr.push(4);
            arr;
        `);
        expect(lastResult?.kind).toBe('ref');
        if (lastResult?.kind === 'ref') {
            const wrapper = lastResult.ref.get();
            expect(wrapper.isArray()).toBe(true);
            if (wrapper.isArray()) {
                expect(wrapper.value.length()).toBe(4);
            }
        }
    });
});
