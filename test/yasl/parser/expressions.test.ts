import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YParser } from '../../../app/lib/core/yasl/parser/YParser';
import { YNodeType } from '../../../app/lib/core/yasl/YAst';

describe('Parser: Expressions & Operators', () => {
    function parseCode(code: string) {
        const lexer = new YLexer(code);
        const parser = new YParser(lexer.getTokens(), lexer.getLineMap());
        return { program: parser.getProgram(), errors: parser.getErrors() };
    }

    it.todo('should parse literals', () => {
        const { program, errors } = parseCode('42; "string"; true; false; null;');
        expect(errors.length).toBe(0);
        
        const statements = program.getStatements() as any[];
        expect(statements[0].exp.type).toBe(YNodeType.EXP_LITERAL); // 42
        expect(statements[1].exp.type).toBe(YNodeType.EXP_LITERAL); // "string"
        expect(statements[2].exp.type).toBe(YNodeType.EXP_LITERAL); // true
        expect(statements[3].exp.type).toBe(YNodeType.EXP_LITERAL); // false
        // null might be evaluated similarly or as null expression
    });

    it('should parse identifiers', () => {
        const { program, errors } = parseCode('myVar;');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.EXP_IDENTIFIER);
        expect(stmt.exp.name).toBe('myVar');
    });

    it('should parse binary operations and respect precedence', () => {
        const { program, errors } = parseCode('1 + 2 * 3;');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.EXP_BINARY);
        
        const right = stmt.exp.expRight;
        // multiplication should be the right node of addition
        expect(right.type).toBe(YNodeType.EXP_BINARY);
    });

    it.todo('should parse unary operations', () => {
        const { program, errors } = parseCode('!x; -y;');
        expect(errors.length).toBe(0);
        const statements = program.getStatements() as any[];
        expect(statements[0].exp.type).toBe(YNodeType.EXP_UNARY);
        expect(statements[1].exp.type).toBe(YNodeType.EXP_UNARY);
    });

    it('should parse postfix operations', () => {
        const { program, errors } = parseCode('x++; y--;');
        expect(errors.length).toBe(0);
        const statements = program.getStatements() as any[];
        expect(statements[0].exp.type).toBe(YNodeType.OP_POSTFIX);
        expect(statements[1].exp.type).toBe(YNodeType.OP_POSTFIX);
    });

    it.todo('should parse ternary operators', () => {
        const { program, errors } = parseCode('x ? y : z;');
        expect(errors.length).toBe(0);
        const stmt = program.getStatements()[0] as any;
        expect(stmt.exp.type).toBe(YNodeType.OP_TERNARY);
    });
});
