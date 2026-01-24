interface Caret {
    row: number;
    col: number;
}

export class CaretModel {
    private defaultCaret: Caret = {row: 0, col: 0};

    getDefaultCaret(): Caret {
        return this.defaultCaret;
    }

    incrementColumn(): void {
        this.defaultCaret.col += 1;
    }

    decrementColumn(): void {
        if (this.defaultCaret.col > 0)
            this.defaultCaret.col -= 1;
    }

    moveColBy(length: number): void {
        this.defaultCaret.col += length;
    }

    setCol(col: number): void {
        if (col >= 0)
            this.defaultCaret.col = col;
    }

    incrementRow(): void {
        this.defaultCaret.row += 1;
    }

    decrementRow(): void {
        if (this.defaultCaret.row > 0)
            this.defaultCaret.row -= 1;
    }

    setRow(row: number): void {
        if (row >= 0)
            this.defaultCaret.row = row;
    }
}