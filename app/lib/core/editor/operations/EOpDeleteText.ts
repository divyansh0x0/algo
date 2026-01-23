import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";
import { EOpInsertText } from "./EOpInsertText";

export default class EOpDeleteText implements EditorOperation {
    private deletedStr: string = "";

    constructor(private col: number, private row: number, private end: number) {
    }

    apply(model: EditorModel): void {
        this.deletedStr = model.document.deleteRange(this.col, this.row, this.end);
    }

    invert(): EditorOperation {
        return new EOpInsertText(this.deletedStr, this.col, this.row);
    }

}