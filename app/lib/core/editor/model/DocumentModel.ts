import type { EditorPosition } from "../EditorPosition";
import { EditorLineTable } from "./EditorLineTable";

export class DocumentModel {
    private text = "";
    private lineTable = new EditorLineTable(this.text);

    insertText(offset: number, insertText: string) {
        this.text = this.text.slice(0, offset) + insertText + this.text.slice(offset);
        this.lineTable.setText(this.text);
    }

    deleteRange(start: number, count: number): string {
        const deleted = this.text.slice(start, start + count);
        this.text = this.text.slice(0, start) + this.text.slice(start + count);
        this.lineTable.setText(this.text);
        return deleted;
    }

    getLine(line: number): string {
        const start = this.lineTable.getLineStart(line);
        const end = line + 1 < this.lineTable.getLineCount()
            ? this.lineTable.getLineStart(line + 1) - 1
            : this.text.length;
        return this.text.slice(start, end);
    }

    getText(): string {
        return this.text;
    }

    getLineCount(): number {
        return this.lineTable.getLineCount();
    }

    getLineAndColumn(offset: number): EditorPosition {
        return this.lineTable.getLineAndColumn(offset);
    }

    getCharacterOffset(line: number, column: number): number {
        return this.lineTable.getCharacterOffset(line, column);
    }

    clearAll(): void {
        this.text = "";
        this.lineTable.setText(this.text);
    }
}