import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YTokenType } from '../../../app/lib/core/yasl/YToken';

describe('Lexer: Core Constructs', () => {
    it('should tokenize variable declarations (let)', () => {
        const lexer = new YLexer('let x;');
        const tokens = lexer.getTokens();
        expect(tokens[0].type).toBe(YTokenType.LET);
        expect(tokens[1].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[1].lexeme).toBe('x');
        expect(tokens[2].type).toBe(YTokenType.STATEMENT_END);
    });

    it('should tokenize assignments', () => {
        const lexer = new YLexer('x = 1; y := 2;');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].lexeme).toBe('x');
        expect(tokens[1].type).toBe(YTokenType.ASSIGN);
        expect(tokens[2].literal).toBe(1);
        expect(tokens[3].type).toBe(YTokenType.STATEMENT_END);

        expect(tokens[4].lexeme).toBe('y');
        expect(tokens[5].type).toBe(YTokenType.INLINE_ASSIGN);
        expect(tokens[6].literal).toBe(2);
        expect(tokens[7].type).toBe(YTokenType.STATEMENT_END);
    });

    it('should tokenize block scoping', () => {
        const lexer = new YLexer('{ let z = 3; }');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.LBRACE);
        expect(tokens[tokens.length - 1].type).toBe(YTokenType.RBRACE);
    });
});
