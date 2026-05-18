import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { TracerVisitor } from '../../../app/lib/core/yasl/visitors/TracerVisitor';

describe('Evaluator: Types', () => {
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

    it.todo('should evaluate and enforce static types', () => {
        // Type checking enforcement during evaluation or statically
    });
});
