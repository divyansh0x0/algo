import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { YNodeType } from '../../../app/lib/core/yasl/YAst';

describe('Parser: Functions & Methods', () => {
    function parseCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        return { program: parser.getProgram(), errors: parser.getErrors() };
    }

    it.todo('should parse function declarations', () => {
        const { program, errors } = parseCode('fn myFunc(a, b) {}');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.DEF_FUNCTION);
        expect(stmt.identifier_name).toBe('myFunc');
        expect(stmt.params.length).toBe(2);
    });

    it('should parse function calls', () => {
        const { program, errors } = parseCode('foo(1, 2);');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.EXP_CALL);
        expect(stmt.exp.args.length).toBe(2);
    });
});
