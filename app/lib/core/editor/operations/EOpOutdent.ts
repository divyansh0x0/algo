import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";
import { EOpIndent } from "./EOpIndent";

/**
 * Removes up to `tabSize` leading spaces from the beginning of each specified
 * line. The `removedPerLine` array is populated externally (by EOpIndent.invert
 * or by the presenter after measuring leading whitespace) to record exactly how
 * many chars were removed on each line so that the inversion is lossless.
 */
export class EOpOutdent implements EditorOperation {
    private outdentedRows: number[] = [];
    constructor(
        private readonly rows: number[],
        private readonly tabSize: number,
    ) {}

    apply(model: EditorModel): void {
        this.outdentedRows = [];
        for (const row of this.rows) {
            const lineStart = model.doc.getLineTable().getLineStart(row);
            const lineText = model.doc.getLineText(row);

            // Count leading spaces (up to tabSize).
            let spaces = 0;
            while (spaces < lineText.length && lineText[spaces] === " " && spaces < this.tabSize) {
                spaces++;
            }

            if(spaces > 0){
                model.doc.deleteRange(lineStart, spaces);
                this.outdentedRows.push(row);
            }
        }
    }

    invert(): EditorOperation {
        // Use the recorded removals to reconstruct exact EOpIndent.
        return new EOpIndent(this.outdentedRows, this.tabSize);
    }

    /**
     * Returns true if at least one line in [startRow, endRow] can be outdented.
     * The presenter calls this before dispatching to decide whether to proceed.
     */
    static canOutdent(model: EditorModel, startRow  : number, endRow: number): boolean {
        for (let line = startRow; line <= endRow; line++) {
            const lineText = model.doc.getLineText(line);
            if (lineText.length > 0 && lineText[0] === " ")
                return true;
        }
        return false;
    }

    getOutdentedLines() {
        return this.outdentedRows;
    }
}
