import { describe, it, expect } from 'vitest';
import { YLexer } from '../../../app/lib/core/yasl/parser/YLexer';
import { YTokenType } from '../../../app/lib/core/yasl/YToken';

describe('Lexer: Expressions & Operators', () => {
    it('should tokenize literals', () => {
        const lexer = new YLexer('42 3.14 "string" true false null');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.NUMBER);
        expect(tokens[1].type).toBe(YTokenType.NUMBER);
        expect(tokens[2].type).toBe(YTokenType.STRING);
        expect(tokens[3].type).toBe(YTokenType.TRUE);
        expect(tokens[4].type).toBe(YTokenType.FALSE);
        expect(tokens[5].type).toBe(YTokenType.NULL);
    });

    it('should tokenize identifiers', () => {
        const lexer = new YLexer('myVar _hiddenVar var123');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[1].type).toBe(YTokenType.IDENTIFIER);
        expect(tokens[2].type).toBe(YTokenType.IDENTIFIER);
    });

    it('should tokenize binary operators', () => {
        const lexer = new YLexer('+ - * / % == != < > <= >= and or & | ^ << >>');
        const tokens = lexer.getTokens();
        const types = tokens.map(t => t.type);
        
        expect(types).toContain(YTokenType.PLUS);
        expect(types).toContain(YTokenType.EQUAL_EQUAL);
        expect(types).toContain(YTokenType.AND);
        expect(types).toContain(YTokenType.BIT_SHIFT_LEFT);
    });

    it('should tokenize unary operators', () => {
        const lexer = new YLexer('!x ~y -z');
        const tokens = lexer.getTokens();
        
        expect(tokens[0].type).toBe(YTokenType.NEGATE);
        expect(tokens[2].type).toBe(YTokenType.BIT_NOT);
        expect(tokens[4].type).toBe(YTokenType.MINUS);
    });

    it('should tokenize postfix operators', () => {
        const lexer = new YLexer('x++ y--');
        const tokens = lexer.getTokens();
        
        expect(tokens[1].type).toBe(YTokenType.INCREMENT);
        expect(tokens[3].type).toBe(YTokenType.DECREMENT);
    });

    it.todo('should tokenize ternary operator', () => {
        // const lexer = new YLexer('x ? y : z');
        // const tokens = lexer.getTokens();
        // expect(tokens).toContain(YTokenType.QUESTION);
    });
});
