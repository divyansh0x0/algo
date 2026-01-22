import type { DocumentModel } from "../../../model/DocumentModel";
import type EditorOperation from "../../../operations/EditorOperation";


type CommandID = string;

export class Keymap {
    private bindings = new Map<CommandID, () => EditorOperation>(
        [
        ]
    );
    private model?: DocumentModel;

    setDocument(model?: DocumentModel): void {
        this.model = model;
    }

    resolve(cmd: string): EditorOperation | undefined {
        if (!this.model) return;

        const binding = this.bindings.get(cmd);
        if (!binding) return;
        return binding();

    }
}