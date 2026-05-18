import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YTokenType } from '../../../app/lib/core/yasl/YToken';

describe('Lexer: Control Flow', () => {
    it('should tokenize if / else if / else', () => {
        const lexer = new YLexer('if (true) {} else if (false) {} else {}');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.IF);
        const elseTokens = tokens.filter(t => t.type === YTokenType.ELSE);
        expect(elseTokens.length).toBe(2);
    });

    it('should tokenize switch / case', () => {
        const lexer = new YLexer('switch (x) { case 1: break; default: break; }');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.SWITCH);
        expect(tokens.find(t => t.type === YTokenType.CASE)).toBeDefined();
        expect(tokens.find(t => t.type === YTokenType.DEFAULT)).toBeDefined();
    });

    it('should tokenize while loops', () => {
        const lexer = new YLexer('while (true) {}');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.WHILE);
    });

    it('should tokenize for loops', () => {
        const lexer = new YLexer('for (let i = 0; i < 10; i++) {}');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.FOR);
    });

    it('should tokenize break and continue', () => {
        const lexer = new YLexer('break; continue;');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.BREAK);
        expect(tokens[2].type).toBe(YTokenType.CONTINUE);
    });

    it('should tokenize return', () => {
        const lexer = new YLexer('return 0;');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.RETURN);
    });
});
