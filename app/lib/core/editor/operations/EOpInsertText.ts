import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";
import EOpDeleteText from "./EOpDeleteText";

export class EOpInsertText implements EditorOperation {
    constructor(private offset:number,private str:string) {}
    apply(model:EditorModel): void {
        model.doc.insertText(this.offset,this.str);
    }

    invert(): EditorOperation {
        return new EOpDeleteText(this.offset, this.str.length);
    }

}