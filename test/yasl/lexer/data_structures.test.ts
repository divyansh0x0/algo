import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YTokenType } from '../../../app/lib/core/yasl/YToken';

describe('Lexer: Data Structures', () => {
    it('should tokenize arrays', () => {
        const lexer = new YLexer('[1, 2, 3]');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.LBRACKET);
        expect(tokens[tokens.length - 1].type).toBe(YTokenType.RBRACKET);
        expect(tokens.find(t => t.type === YTokenType.COMMA)).toBeDefined();
    });

    it('should tokenize array indexing', () => {
        const lexer = new YLexer('arr[0]');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[1].type).toBe(YTokenType.LBRACKET);
        expect(tokens[2].type).toBe(YTokenType.NUMBER);
        expect(tokens[3].type).toBe(YTokenType.RBRACKET);
    });

    it('should tokenize property access', () => {
        const lexer = new YLexer('obj.prop');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[1].type).toBe(YTokenType.DOT);
        expect(tokens[2].type).toBe(YTokenType.IDENTIFIER);
    });
});
