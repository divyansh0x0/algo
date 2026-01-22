export class DocumentModel {
    private lines: string[] = [];

    insertText(text: string, col: number, row: number): void {
        if (row >= this.lines.length)
            this.lines.push(text);
        else {
            const line = this.lines[row];
            if (!line)
                return;
            this.lines[row] = line.substring(0, col) + text + line.substring(col);
        }
    }

    deleteRange(col: number, row: number, start: number, end: number): void {
        // raw deletion
    }

    getText(): string {
        return this.lines.join("\n");
    }
}