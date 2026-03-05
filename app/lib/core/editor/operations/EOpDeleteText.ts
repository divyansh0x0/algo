import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";
import { EOpInsertText } from "./EOpInsertText";

export default class EOpDeleteText implements EditorOperation {
    private deletedStr: string = "";

    constructor(private offset:number, private count: number) {
    }

    apply(model: EditorModel): void {
        this.deletedStr = model.doc.deleteRange(this.offset, this.count);
    }

    invert(): EditorOperation {
        return new EOpInsertText(this.offset,this.deletedStr);
    }

}