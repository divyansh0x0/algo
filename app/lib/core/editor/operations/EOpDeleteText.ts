import { start } from "node:repl";
import type { DocumentModel } from "../model/DocumentModel";
import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";

export default class EOpDeleteText implements EditorOperation {
    constructor(private start:number, private end:number) {}
    apply(model:EditorModel): void {
        model.document.deleteRange(this.start, this.end);
    }

    invert(model:EditorModel): EditorOperation {
        return undefined;
    }

}