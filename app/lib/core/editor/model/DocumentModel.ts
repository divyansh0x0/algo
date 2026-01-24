export class DocumentModel {
    private lines: string[] = [];

    insertSubstr(text: string, col: number, row: number): void {
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

    deleteRange(col: number, row: number, count: number): string {
        // raw deletion
        const line = this.lines[row];
        if (!line)
            return "";

        if(count > 0)
            this.lines[row] = line.substring(0, col+1) + line.substring(count+1);
        else
            this.lines[row] = line.substring(0, col + count);
        console.log("deleting",line.substring(0, col + count) + line.substring(col + count), col,row,count)

        return line.substring(col, count);
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

    getLineCount(): number {
        return this.lines.length;
    }

    insertText(s: string): void {
        const lines = s.split("\n");

        for (let i = 0; i < lines.length; i++) {
            this.insertSubstr(lines[i]!,0,i);
        }
    }
}