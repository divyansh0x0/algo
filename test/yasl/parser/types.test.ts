import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { YNodeType } from '../../../app/lib/core/yasl/YAst';

describe('Parser: Types', () => {
    function parseCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        return { program: parser.getProgram(), errors: parser.getErrors() };
    }

    it.todo('should parse static type annotations', () => {
        const { program, errors } = parseCode('let x: number = 1;');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_DECLARATION);
        expect(stmt.types).toBeDefined();
        expect(stmt.types.has(0)).toBe(true); // YValueType.Number == 0 probably
    });

    it.todo('should parse union types', () => {
        const { program, errors } = parseCode('let x: string | number = "test";');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_DECLARATION);
        expect(stmt.types.size).toBe(2);
    });
});
