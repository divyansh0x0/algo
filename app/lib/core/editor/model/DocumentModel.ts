export class DocumentModel {
    private lines: string[] = [];

    insertText(text: string, col: number, row: number): void {
        if (row >= this.lines.length)
            this.lines.push(text);
        else {
            const line = this.lines[row];
            if (line === undefined)
                return;
            this.lines[row] = line.substring(0, col) + text + line.substring(col);
            // console.log(text, line, col, row,this.lines,line.substring(0, col) + text + line.substring(col));

        }
    }

    deleteRange(col: number, row: number, end: number): string {
        // raw deletion
        const line = this.lines[row];
        if (!line)
            return "";

        this.lines[row] = line.substring(0, col) + line.substring(end);

        return line.substring(col, end);
    }

    getLines(): string[] {
        return this.lines;
    }

    getText(): string {
        return this.lines.join("\n");
    }

    getLine(row: number): string {
        if (row >= this.lines.length)
            return "";
        return this.lines[row]!;
    }
}