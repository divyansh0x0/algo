export class DocumentModel {
    private lines: string[] = [];
    insertText( text: string, col:number, row:number): void {
        // raw string mutation
        if(row >= this.lines.length)
            this.lines.push( text );
        else{
            const line = this.lines[row]
            if(col >= this.lines.length)
                col = this.lines.length - 1;
            if(line)
                this.lines[row] = line.substring(0, col) + text + line.substring(col);
        }
        console.log(text, col,row);
    }

    deleteRange(start: number, end: number): void {
        // raw deletion
    }

    getText(): string {
        return this.lines.join("\n");
    }
}