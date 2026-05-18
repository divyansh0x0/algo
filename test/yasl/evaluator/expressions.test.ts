import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { TracerVisitor } from '../../../app/lib/core/yasl/visitors/TracerVisitor';

describe('Evaluator: Expressions & Operators', () => {
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

    it('should evaluate mathematical operations', () => {
        const { lastResult } = evaluateCode(`
            let y = 10 + 20 * 2;
            y;
        `);
        expect(lastResult?.kind).toBe('ref');
        if (lastResult?.kind === 'ref') {
            const wrapper = lastResult.ref.get();
            expect(wrapper.isNumber()).toBe(true);
            if (wrapper.isNumber()) {
                expect(wrapper.value).toBe(50);
            }
        }
    });

    it('should evaluate boolean assignment and logical operators', () => {
        const { lastResult } = evaluateCode(`
            let boolResult = true;
            boolResult;
        `);
        expect(lastResult?.kind).toBe('ref');
        if (lastResult?.kind === 'ref') {
            const wrapper = lastResult.ref.get();
            expect(wrapper.isBoolean()).toBe(true);
            if (wrapper.isBoolean()) {
                expect(wrapper.value).toBe(true);
            }
        }
    });

    it.todo('should evaluate unary operators', () => {
        // -x, !y, ~z
    });

    it.todo('should evaluate postfix operators', () => {
        // x++, x--
    });

    it.todo('should evaluate ternary operator', () => {
        // x ? y : z
    });
});
