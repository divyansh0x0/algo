import EOpDeleteText from "../operations/EOpDeleteText";
import { EOpInsertText } from "../operations/EOpInsertText";
import { OperationDispatcher } from "../operations/OperationDispatcher";
import type { DocumentModel } from "./DocumentModel";
import { EditorSelection } from "./EditorSelection";

const SETTINGS = {
  tabSize: 6,
};
export class EditorModel {
    // readonly document: DocumentModel;
    carets: number[] = [ 0 ];

    // stores start and end column of selection
    readonly selections: EditorSelection[] = [];
    readonly opDispatcher = new OperationDispatcher(this);
    get settings(){
        return SETTINGS
    }

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

    hasSelections(): boolean {
        return this.selections.length > 0;
    }

    insertAt(offset: number,text: string): void {
        this.opDispatcher.execute(new EOpInsertText(offset, text));
    }
}
