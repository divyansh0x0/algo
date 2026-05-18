import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { YNodeType } from '../../../app/lib/core/yasl/YAst';

describe('Parser: Control Flow', () => {
    function parseCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        return { program: parser.getProgram(), errors: parser.getErrors() };
    }

    it('should parse if / else if / else statements', () => {
        const { program, errors } = parseCode('if (true) {} else if (false) {} else {}');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_IF);
        // Assert else-if and else blocks
    });

    it.todo('should parse switch / case statements', () => {
        const { program, errors } = parseCode('switch (x) { 1: break; _: break; }');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_SWITCH);
    });

    it.todo('should parse while loops', () => {
        const { program, errors } = parseCode('while (true) {}');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_WHILE);
    });

    it.todo('should parse for loops', () => {
        const { program, errors } = parseCode('for (let i = 0; i < 10; i++) {}');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_FOR);
    });

    it.todo('should parse break and continue', () => {
        const { program, errors } = parseCode('while(true) { break; continue; }');
        expect(errors.length).toBe(0);
        // Inspect body statements for STMT_BREAK and STMT_CONTINUE
    });

    it.todo('should parse return', () => {
        const { program, errors } = parseCode('return 0;');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_RETURN);
    });
});
