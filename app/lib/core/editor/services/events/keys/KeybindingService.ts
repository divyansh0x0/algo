import type { DocumentModel } from "../../../model/DocumentModel";
import type { EditorModel } from "../../../model/EditorModel";
import type EditorOperation from "../../../operations/EditorOperation";
import { EOpInsertText } from "../../../operations/EOpInsertText";
import  { OperationDispatcher } from "../../../operations/OperationDispatcher";
import { Keymap } from "./Keymap";

export class KeybindingService {
    private keymap = new Keymap();
    private lastCmd:string ="";
    private model? : EditorModel;

    setEditorModel(model : EditorModel) : void {
        this.model = model;
    }

    handle(ctrlKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean, code: string, key: string): void {
        if(!this.model)
            return;
        const isShortcut =  ctrlKey || metaKey || (ctrlKey && altKey) || (ctrlKey && shiftKey);
        if (!isShortcut) {
            this.model.getOpDispatcher().execute(new EOpInsertText(key))
            return;
        }
        let cmd = "";
        if(metaKey)
            cmd += "meta+";
        if(ctrlKey)
            cmd += "ctrl+";
        if(altKey)
            cmd += "alt+";
        if(shiftKey)
            cmd += "shift+";
        cmd += code;

        if(this.lastCmd !== cmd){
            this.keymap.handle(cmd);
            this.lastCmd = cmd;
        }

    }
}