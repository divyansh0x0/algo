import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YTokenType } from '../../../app/lib/core/yasl/YToken';

describe('Lexer: Types', () => {
    it('should tokenize type annotations', () => {
        const lexer = new YLexer('let x: number = 1;');
        const tokens = lexer.getTokens();
        
        expect(tokens[2].type).toBe(YTokenType.COLON);
        expect(tokens[3].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[3].lexeme).toBe('number');
    });

    it('should tokenize union types', () => {
        const lexer = new YLexer('let x: string | number;');
        const tokens = lexer.getTokens();
        
        expect(tokens[4].type).toBe(YTokenType.BIT_OR); // Currently using BIT_OR for union type syntax |
        expect(tokens[5].lexeme).toBe('number');
    });
});
