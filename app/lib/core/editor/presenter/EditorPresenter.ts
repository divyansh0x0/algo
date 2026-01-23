import { DocumentModel } from "../model/DocumentModel";
import { EditorModel } from "../model/EditorModel";
import EOpDeleteText from "../operations/EOpDeleteText";
import { EOpInsertText } from "../operations/EOpInsertText";
import { KeybindingService } from "../services/events/keys/KeybindingService";
import { Keymap } from "../services/events/keys/Keymap";

import type { EditorView } from "../view/EditorView";

function CountChars(line: string, s: string): number {
    let count = 0;
    for (let i = 0; i < line.length; i++) {
        const char = line.charAt(i);
        if (char === s)
            count++;
        else
            break;
    }
    return count;
}

class EditorPresenter {
    private doc: DocumentModel;
    private model:EditorModel;
    private keybindingService=new KeybindingService();
    private keymap = new Keymap();
    constructor(private view:EditorView) {
        view.onKeyUp(this.onKeyUp.bind(this));
        view.onKeyDown(this.onKeyDown.bind(this));
        view.onMouseUp(this.onMouseUp.bind(this));
        view.onMouseDown(this.onMouseDown.bind(this));

        this.doc = new DocumentModel();
        this.model = new EditorModel(this.doc);

    }
    private onKeyDown(event:KeyboardEvent){
        event.preventDefault();
        event.stopPropagation();

        const editorOperation = this.keybindingService.resolve(event.ctrlKey,event.altKey,event.shiftKey, event.metaKey, event.code,event.key);
        if(!editorOperation) return;


        switch(editorOperation.type){
            case "insertChar":
                this.insertChar(editorOperation.text);
                break;
            case "command":
                this.handleCommand(editorOperation.command);
                break;
            case "deleteLeft":
                this.deleteCharLeft();
                break;
            case "newline":
                this.createNewLine();
                break
            default:
                console.error("Unknown editor operation");
                break;

        }
        this.view.render(this.model);
    }
    private onKeyUp(event:KeyboardEvent){}
    private onMouseUp(event:MouseEvent){}
    private onMouseDown(event:MouseEvent){}

    private insertChar(text:string){
        const carets = this.model.getCarets();
        const defaultCaret = carets.getDefaultCaret();
        console.log("Insert char: ", defaultCaret.col,defaultCaret.row);
        this.model.getOpDispatcher().execute(new EOpInsertText(text,defaultCaret.col,defaultCaret.row));

        if(text === "\n"){
            carets.incrementRow();
            carets.setCol(0)
        }
        else{
            carets.moveColBy(text.length);
        }
    }

    private handleCommand(command: string): void {
        const cmd = this.keymap.resolve(command);
        cmd?.apply(this.model)
    }

    private deleteCharLeft(): void {
        const carets = this.model.getCarets();
        const defaultCaret = carets.getDefaultCaret();
        this.model.getOpDispatcher().execute(new EOpDeleteText(defaultCaret.col,defaultCaret.row, defaultCaret.col - 1));
    }

    private createNewLine(): void {
        const carets = this.model.getCarets();
        const col = CountChars(this.model.document.getLine(carets.getDefaultCaret().row), " ");
        const row = carets.getDefaultCaret().row + 1;
        console.log("New line: ", col, row);
        this.model.getOpDispatcher().execute(new EOpInsertText(" ".repeat(col), 0,row))
        this.model.getCarets().incrementRow();
        this.model.getCarets().setCol(col);
    }
}

export default EditorPresenter;