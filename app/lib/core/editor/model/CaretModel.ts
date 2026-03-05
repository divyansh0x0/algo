export class CaretModel {
    private carets

    getDefaultCaret(): Caret {
        return this.defaultCaret;
    }

    incrementColumn(): void {
        this.defaultCaret.offset += 1;
    }

    decrementColumn(): void {
        if (this.defaultCaret.offset > 0)
            this.defaultCaret.offset -= 1;
    }

    moveBy(length: number): void {
            this.defaultCaret.offset = Math.max(0,this.defaultCaret.offset + length);
    }

    setOffset(col: number): void {
        if (col >= 0)
            this.defaultCaret.offset = col;
    }
}