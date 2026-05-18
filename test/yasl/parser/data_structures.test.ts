import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { YNodeType } from '../../../app/lib/core/yasl/YAst';

describe('Parser: Data Structures', () => {
    function parseCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        return { program: parser.getProgram(), errors: parser.getErrors() };
    }

    it.todo('should parse array literals', () => {
        const { program, errors } = parseCode('[1, 2, 3];');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.DEF_ARRAY);
        expect(stmt.exp.elements.length).toBe(3);
    });

    it('should parse array indexing', () => {
        const { program, errors } = parseCode('arr[0];');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.OP_INDEXING);
    });

    it('should parse property access', () => {
        const { program, errors } = parseCode('obj.prop;');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.EXP_PROPERTY_ACCESS);
    });
});
