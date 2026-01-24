import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";

export class EopMergeRow implements EditorOperation {
    /**
     * Concatenates row1 with row2 and deletes row2. Row1 will become row1 + row2.
     * @param row1 Must be greater than 0 and less than total lines
     * @param row2 Must be greater than 0 and less than total lines
     */
    private row1Length = 0;
    constructor(private row1: number, private row2: number) {}

    apply(model: EditorModel): void {
        const line1 = model.document.getLine(this.row1);
        this.row1Length = line1.length;

        const line2 = model.document.getLine(this.row2);

        const concatenatedLine = line1 + line2;

        model.document.deleteLine(this.row2);
        model.document.replaceLineContent(concatenatedLine, this.row1);
    }
    invert(): EditorOperation {
        throw new Error("Method not implemented.");
    }

}