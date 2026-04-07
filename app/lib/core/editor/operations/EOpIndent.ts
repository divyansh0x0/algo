import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";
import { EOpOutdent } from "./EOpOutdent";

/**
 * Inserts `tabSize` spaces at the beginning of each line in `lines`.
 * Lines must be sorted ascending. The inverse is EOpOutdent over the same lines.
 */
export class EOpIndent implements EditorOperation {
    constructor(
        private readonly rows: number[],
        private readonly tabSize: number) {
    }

    apply(model: EditorModel): void {
        const tab = " ".repeat(this.tabSize);
        // Process lines in reverse so earlier line-start offsets aren't invalidated.
        for (const row of this.rows) {
            const offset = model.doc.getLineTable().getLineStart(row);
            model.doc.insertText(offset, tab);
        }
        // const selections = model.selections;
        // const lineCount = this.lineEnd - this.lineStart + 1;
        // for (const selection of selections) {
        //     if (!selection.isReversed()) {
        //         selection.anchor += this.tabSize;
        //         selection.active += this.tabSize * lineCount;
        //     } else {
        //         selection.active += this.tabSize;
        //         selection.anchor += this.tabSize * lineCount;
        //     }
        // }
        // for (let i = 0; i < model.carets.length; ++i) {
        //     model.carets[i]! += this.tabSize * lineCount;
        // }
    }

    invert(): EditorOperation {
        return new EOpOutdent(this.rows, this.tabSize);
    }
}
