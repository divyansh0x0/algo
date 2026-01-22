import type { DocumentModel } from "../../../model/DocumentModel";
import { CopyCommand } from "./commands/CopyCommand";
import type { EditorCommand } from "./commands/EditorCommand";

type CommandID = string;
export class Keymap{
    private bindings = new Map<CommandID, ()=> EditorCommand>(
        [
            ["ctrl+c", ()=> new CopyCommand()],
        ]
    )
    private model?:  DocumentModel;

    setDocument(model?:DocumentModel):void{
        this.model = model;
    }

    handle(cmd: string): void {
        if(!this.model) return;

       const binding =  this.bindings.get(cmd);
       if(!binding) return;
       binding().execute(this.model);

    }
}