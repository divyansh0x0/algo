import type { CaretModel } from "../model/CaretModel";
import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";
import EOpDeleteText from "./EOpDeleteText";

export class EOpInsertText implements EditorOperation {
    constructor(private str:string, private col:number, private row:number) {}
    apply(model:EditorModel): void {
        model.document.insertSubstr(this.str, this.col, this.row);
    }

    invert(): EditorOperation {
        return new EOpDeleteText(this.col,this.row, this.str.length);
    }

}