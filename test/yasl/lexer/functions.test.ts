import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YTokenType } from '../../../app/lib/core/yasl/YToken';

describe('Lexer: Functions & Methods', () => {
    it('should tokenize function declarations', () => {
        const lexer = new YLexer('fn myFunc(a, b) {}');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.FUNCTION);
        expect(tokens[1].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[2].type).toBe(YTokenType.LPAREN);
        expect(tokens[3].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[4].type).toBe(YTokenType.COMMA);
        expect(tokens[5].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[6].type).toBe(YTokenType.RPAREN);
    });

    it('should tokenize function calls', () => {
        const lexer = new YLexer('foo(1, 2)');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[1].type).toBe(YTokenType.LPAREN);
        expect(tokens[2].type).toBe(YTokenType.NUMBER);
        expect(tokens[3].type).toBe(YTokenType.COMMA);
        expect(tokens[4].type).toBe(YTokenType.NUMBER);
        expect(tokens[5].type).toBe(YTokenType.RPAREN);
    });
});
