import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { TracerVisitor } from '../../../app/lib/core/yasl/visitors/TracerVisitor';

describe('Evaluator: Core Constructs', () => {
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

    it('should evaluate variable declaration and retrieval', () => {
        const { lastResult } = evaluateCode(`
            let x = 42;
            x;
        `);
        expect(lastResult?.kind).toBe('ref');
        if (lastResult?.kind === 'ref') {
            const wrapper = lastResult.ref.get();
            expect(wrapper.isNumber()).toBe(true);
            if (wrapper.isNumber()) {
                expect(wrapper.value).toBe(42);
            }
        }
    });

    it('should evaluate inline assignments', () => {
        const { lastResult } = evaluateCode(`
            let a = 1;
            a := a + 1;
            a;
        `);
        expect(lastResult?.kind).toBe('ref');
        if (lastResult?.kind === 'ref') {
            const wrapper = lastResult.ref.get();
            expect(wrapper.isNumber()).toBe(true);
            if (wrapper.isNumber()) {
                expect(wrapper.value).toBe(2);
            }
        }
    });

    it('should evaluate block scoping correctly', () => {
        const { lastResult } = evaluateCode(`
            let z = 10;
            {
                let z = 20;
            }
            z;
        `);
        expect(lastResult?.kind).toBe('ref');
        if (lastResult?.kind === 'ref') {
            const wrapper = lastResult.ref.get();
            expect(wrapper.isNumber()).toBe(true);
            if (wrapper.isNumber()) {
                expect(wrapper.value).toBe(10); // outer z should be unaffected if properly scoped
            }
        }
    });
});
