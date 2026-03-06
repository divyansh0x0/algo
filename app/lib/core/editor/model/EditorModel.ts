import EOpDeleteText from "../operations/EOpDeleteText";
import { EOpInsertText } from "../operations/EOpInsertText";
import { OperationDispatcher } from "../operations/OperationDispatcher";
import type { DocumentModel } from "./DocumentModel";


export class EditorModel {
    // readonly document: DocumentModel;
    carets: number[] = [ 0 ];
    readonly selection: [ number, number ][] = [];
    readonly opDispatcher = new OperationDispatcher(this);

    constructor(readonly doc: DocumentModel) {
    }

    deleteChars(delta: number): void {
        if (delta === 0)
            return;
        for (let i = 0; i < this.carets.length; i++){
            const caret = this.carets[i]!;
            if (delta > 0)
                this.opDispatcher.execute(new EOpDeleteText(caret, delta));
            else{
                console.error(caret + delta, caret);
                this.opDispatcher.execute(new EOpDeleteText(caret + delta, -delta));
                this.carets[i]! += delta;
            }
        }
    }

    insertText(text: string): void {
        const carets = this.carets;
        for (let i = 0; i < carets.length; i++) {
            const caret = this.carets[i]!;
            this.opDispatcher.execute(new EOpInsertText(caret,text));
            this.carets[i]! += text.length;
        }
    }
}
