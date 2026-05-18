import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { YNodeType } from '../../../app/lib/core/yasl/YAst';

describe('Parser: Core Constructs', () => {
    function parseCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        return { program: parser.getProgram(), errors: parser.getErrors() };
    }

    it('should parse variable declarations', () => {
        const { program, errors } = parseCode('let x = 10;');
        expect(errors.length).toBe(0);
        
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_DECLARATION);
        expect(stmt.lvalue).toBe('x');
        expect(stmt.rvalue.type).toBe(YNodeType.EXP_LITERAL);
        expect(stmt.rvalue.value.value).toBe(10);
    });

    it.todo('should parse assignments', () => {
        const { program, errors } = parseCode('x = 5; y := 10;');
        expect(errors.length).toBe(0);
        
        const statements = program.getStatements();
        expect(statements[0].type).toBe(YNodeType.STMT_EXPRESSION); // Currently parsed as expression statement
        expect((statements[0] as any).exp.type).toBe(YNodeType.STMT_ASSIGN);
        
        expect(statements[1].type).toBe(YNodeType.STMT_EXPRESSION);
        expect((statements[1] as any).exp.type).toBe(YNodeType.EXP_ASSIGN); // Inline assign
    });

    it('should parse block scoping', () => {
        const { program, errors } = parseCode('{ let z = 3; }');
        expect(errors.length).toBe(0);
        
        const stmt = program.getStatements()[0] as any;
        expect(stmt.type).toBe(YNodeType.STMT_EXPRESSION);
        expect(stmt.exp.type).toBe(YNodeType.EXP_BLOCK);
    });
});
