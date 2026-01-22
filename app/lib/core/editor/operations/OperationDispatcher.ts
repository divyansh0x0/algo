import type { DocumentModel } from "../model/DocumentModel";
import type { EditorModel } from "../model/EditorModel";
import type EditorOperation from "./EditorOperation";

export class OperationDispatcher {
    private undoStack: EditorOperation[] = [];
    private redoStack: EditorOperation[] = [];

    constructor(private model:EditorModel) {}
    execute(op: EditorOperation) {
        op.apply(this.model);
        this.undoStack.push(op);
        this.redoStack = [];
    }

    undo() {
        const op = this.undoStack.pop();
        if (!op) return;

        const inverse = op.invert(this.model);
        inverse.apply(this.model);
        this.redoStack.push(op);
    }

    redo() {
        const op = this.redoStack.pop();
        if (!op) return;

        op.apply(this.model);
        this.undoStack.push(op);
    }
}