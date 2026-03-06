import { MathUtils } from "../../engine/utils";
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
    private onMouseMoveBound = this.onMouseMove.bind(this);
    private onMouseUpBound = this.onMouseUp.bind(this);
    private keybindingService = new KeybindingService();
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

    getCode(): string {
        return this.model.doc.getText();
    }

    setCode(code: string): void {
        this.model.doc.clearAll();
        this.model.doc.insertText(0, code);
        this.renderView();
    }

    clampEditorPosition(position: EditorPosition) {
        const maxLines = this.model.doc.getLineCount();
        position.line = MathUtils.clamp(position.line, 0, maxLines);

        const lineEnd: number = this.model.doc.getLineTable().getLineEnd(position.line);
        const lineStart: number = this.model.doc.getLineTable().getLineStart(position.line);
        const maxCol = lineEnd - lineStart;
        position.column = MathUtils.clamp(position.column, 0, maxCol);
    }

    private onKeyDown(event: KeyboardEvent) {
        console.log("Keydown");
        const editorIntent = this.keybindingService.resolve(
            event.ctrlKey,
            event.altKey,
            event.shiftKey,
            event.metaKey,
            event.code,
            event.key
        );
        if (!editorIntent) return;

        console.log(editorIntent);
        const handler = this.handlers[editorIntent.type] as (intent: typeof editorIntent) => void;
        handler?.(editorIntent);
        this.resetSelection()
        this.renderView();
    }

    private onMouseUp() {
        this.mouseState.isDown = false;
        window.removeEventListener("mousemove", this.onMouseMoveBound);
        window.removeEventListener("mouseup", this.onMouseUpBound);
    }

    private onMouseDown(event: MouseEvent) {
        this.mouseState.isDown = true;
        this.mouseState.startX = event.clientX;
        this.mouseState.startY = event.clientY;

        const position = this.getEditorPosition(event);

        this.clampEditorPosition(position);
        this.updateCaret(position);
        this.resetSelection();
        window.addEventListener("mousemove", this.onMouseMoveBound);
        window.addEventListener("mouseup", this.onMouseUpBound);
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.mouseState?.isDown) return;

        const position = this.getEditorPosition(event);
        this.clampEditorPosition(position);
        this.updateSelection(position);
        this.updateCaret(position);
        this.renderView();
    }

    private getEditorPosition(event: MouseEvent) {
        return this.view.getEditorPosition(event.clientX, event.clientY);
    }

    private insertChar(text: string) {


        this.model.insertText(text);
    }

    private deleteChars(delta: number): void {
        if (delta == 0)
            return;

        this.model.deleteChars(delta);
    }

    private renderView(): void {
        this.view.render(this.model);
    }

    private updateCaret(position: EditorPosition): void {
        const offset = this.model.doc.getCharacterOffset(position.line, position.column);
        this.model.carets = [ offset ];
        this.renderView();
    }

    private updateSelection(position: EditorPosition): void {
        const offset = this.model.doc.getCharacterOffset(position.line, position.column);
        if (this.model.selection.length !== 1) {
            this.model.selection.length = 0;
            this.model.selection.push([ offset, offset ]);
            return;
        }
        //Set end to the offset
        this.model.selection[0]![1] = offset;
        this.renderView();
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
            const caretOffset = this.model.carets[i]!;
            this.model.carets[i] = MathUtils.clamp(caretOffset + delta, 0, this.model.doc.getMaxOffset());
        }
    }

    private createNewLine(): void {
        this.insertChar("\n");
    }

    private resetSelection(position?: EditorPosition): void {
        if(position === undefined){
            this.model.selection.length = 0;
            this.renderView();
            return;
        }
        const offset = this.model.doc.getCharacterOffset(position.line, position.column);
        this.model.selection.length = 0;
        this.model.selection.push([ offset, offset ]);
        this.renderView();
    }
}

export default EditorPresenter;