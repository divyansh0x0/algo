import type { EditorPosition } from "../EditorPosition";

export class EditorLineTable {
    private lineStarts: number[] = [];

    constructor(private text: string= "") {
        this.buildLineStarts();
    }
    private buildLineStarts() {
        this.lineStarts = [0];
        for (let i = 0; i < this.text.length; ++i ) {
            if (this.text[i] === '\n') {
                this.lineStarts.push(i + 1);
            }
        }
    }
    getLineAndColumn(offset: number): EditorPosition {
        const line = this.findLine(offset);
        if(this.lineStarts[line] == undefined) {
            return {line:0, column:0};
        }
        return { line, column: offset - this.lineStarts[line] };
    }
    getCharacterOffset(line: number, column: number): number {
        if(this.getLineStart(line) === undefined) {
            return 0;
        }
        const lineStart = this.getLineStart(line);
        return Math.min(lineStart + column, this.getLineStart(line + 1));
    }
    getLineStart(line: number): number {
        if(line < 0){
            return 0;
        }
        return  line < this.getLineCount() ? this.lineStarts[line]! : this.lineStarts[this.getLineCount() - 1]!;
    }
    // Binary search
    private findLine(offset: number): number {
        let low = 0, high = this.lineStarts.length - 1;
        while (low <= high) {
            const mid = (low + high) >> 1;
            if (this.lineStarts[mid]! > offset) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return low - 1;
    }
    getLineCount(): number {
        return this.lineStarts.length;
    }
    setText(text: string) {
        this.text = text;
        this.buildLineStarts();
    }
}