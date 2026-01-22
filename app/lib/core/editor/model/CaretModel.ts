interface Caret{
    row:number;
    col:number;
}

export class CaretModel {
    private defaultCaret: Caret = {row:0, col:0};

    getDefaultCaret(): Caret {
        return this.defaultCaret;
    }

    incrementColumn(): void {
        // console.log("sad")
        this.defaultCaret.col += 1;
    }

    moveColBy(length: number): void {
        this.defaultCaret.col += length;
    }

    setCol(col:number):void {
        this.defaultCaret.col = col;
    }
    incrementRow(): void {
        this.defaultCaret.row += 1;
    }
}