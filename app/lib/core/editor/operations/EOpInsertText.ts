import type { CaretModel } from "../model/CaretModel";
import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";

export class EOpInsertText implements EditorOperation {
    constructor(private str:string, private col:number, private row:number) {}
    apply(model:EditorModel): void {
        model.document.insertText(this.str, this.col, this.row);
    }

    invert(): EditorOperation {
        return undefined;
    }

}