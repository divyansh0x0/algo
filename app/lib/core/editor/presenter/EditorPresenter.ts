import type { EditorPosition } from "../EditorPosition";
import { DocumentModel } from "../model/DocumentModel";
import { EditorModel } from "../model/EditorModel";
import { type EditorIntent, KeybindingService } from "../services/events/keys/KeybindingService";


import type { EditorView } from "../view/EditorView";

// function CountChars(line: string, s: string): number {
//     let count = 0;
//     for (let i = 0; i < line.length; i++) {
//         const char = line.charAt(i);
//         if (char === s)
//             count++;
//         else
//             break;
//     }
//     return count;
// }


class EditorPresenter {
    private model: EditorModel;
    private mouseState = {
        isDown: false,
        startX: 0,
        startY: 0
    };
    private keybindingService = new KeybindingService();
    constructor(private view: EditorView) {
        view.onKeyDown(this.onKeyDown.bind(this));
        view.onMouseDown(this.onMouseDown.bind(this));

        this.model = new EditorModel(new DocumentModel());
        this.mouseState = {
            isDown: false,
            startX: 0,
            startY: 0
        };
        window.requestAnimationFrame(() => {
            this.view.render(this.model);
        });
    }
    private handlers: {
        [K in EditorIntent["type"]]?: (intent: Extract<EditorIntent, { type: K }>) => void;
    } = {
        insertChar: (intent) => this.insertChar(intent.text),

        deleteLeft: () => this.deleteChars(-1),
        deleteRight: () => this.deleteChars(1),

        newline: () => this.createNewLine(),

        moveRight: () => this.moveCaretHorizontallyBy(1),
        moveLeft: () => this.moveCaretHorizontallyBy(-1),

        moveUp: () => this.moveCaretVerticallyBy(-1),
        moveDown: () => this.moveCaretVerticallyBy(1),
    };
    private onKeyDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Keydown")
        const editorIntent = this.keybindingService.resolve(
            event.ctrlKey,
            event.altKey,
            event.shiftKey,
            event.metaKey,
            event.code,
            event.key
        );
        if (!editorIntent) return;

        console.log(editorIntent)
        const handler = this.handlers[editorIntent.type] as (intent: typeof editorIntent) => void;
        handler?.(editorIntent);
        this.renderView();
    }

    private onMouseUp() {
        this.mouseState.isDown = false;
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    private onMouseDown(event: MouseEvent) {
        // event.preventDefault();

        this.mouseState.isDown = true;
        this.mouseState.startX = event.clientX;
        this.mouseState.startY = event.clientY;

        const position = this.getEditorPosition(event);

        this.setUniCaret(position);

        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
    private onMouseMove(event: MouseEvent) {
        if (!this.mouseState?.isDown) return;

        const position = this.getEditorPosition(event);

        this.updateSelection(position);

        this.renderView();
    }
    private getEditorPosition(event: MouseEvent) {
        return  this.view.getEditorPosition(event.clientX, event.clientY);
    }
    private insertChar(text: string) {


        this.model.insertText(text);
    }

    private deleteChars(delta: number): void {
        if(delta == 0)
            return;

        this.model.deleteChars(delta);
    }


    getCode(): string {
        return this.model.doc.getText();
    }
    setCode(code: string): void {
        this.model.doc.clearAll();
        this.model.doc.insertText(0, code);
        this.renderView();
    }

    private renderView(): void {
        this.view.render(this.model);
    }


    private setUniCaret(position: EditorPosition): void {
        this.model.carets.length = 0;
        this.model.carets.push(this.model.doc.getCharacterOffset(position.line, position.column));
    }

    private updateSelection(position: EditorPosition): void {
        const offset = this.model.doc.getCharacterOffset(position.line, position.column);
        if(this.model.selection.length !== 1){
            this.model.selection.length = 0;
            this.model.selection.push([offset,offset]);
            return;
        }
        //Set end to the offset
        this.model.selection[0]![1] = offset;
    }

    private moveCaretVerticallyBy(delta: number): void {
        const doc: DocumentModel = this.model.doc;
        const carets: number[] = this.model.carets;
        for (let i = 0; i < carets.length; i++) {
            const caret = carets[i]!;
            const pos = doc.getLineAndColumn(caret);
            carets[i] = doc.getCharacterOffset(pos.line + delta, pos.column);
        }
    }

    private moveCaretHorizontallyBy(delta: number): void {
        for (let i = 0; i < this.model.carets.length; i++) {
            this.model.carets[i]!  += delta;
        }
    }

    private createNewLine(): void {
        this.insertChar("\n");
    }
}

export default EditorPresenter;