import type { CaretModel } from "../model/CaretModel";
import type { DocumentModel } from "../model/DocumentModel";
import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";

export class EOpInsertText implements EditorOperation {
    constructor(private str:string) {}
    apply(model:EditorModel): void {
        const caret: CaretModel = model.getCaret();
        model.document.insertText(this.str, caret.getColumn(), caret.getRow())
        caret.incrementColumn();
    }

    invert(): EditorOperation {
        return undefined;
    }

}