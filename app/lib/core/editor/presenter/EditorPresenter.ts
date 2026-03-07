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

        deleteLeft: () => this.handleDeleteLeft(),
        deleteRight: () => this.handleDeleteRight(),

        newline: () => this.createNewLine(),

        moveRight: () => this.handleRightMoveCaret(),
        moveLeft: () => this.handleLeftMoveCaret(),

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
        this.resetSelection();
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
        this.deleteSelection();
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
        if (this.model.selections.length !== 1) {
            this.model.selections.length = 0;
            this.model.selections.push([ offset, offset ]);
            return;
        }
        //Set end to the offset
        this.model.selections[0]![1] = offset;
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
        this.renderView();
    }

    private moveCaretHorizontallyBy(delta: number): void {
        for (let i = 0; i < this.model.carets.length; i++) {
            const caretOffset = this.model.carets[i]!;
            this.model.carets[i] = MathUtils.clamp(caretOffset + delta, 0, this.model.doc.getMaxOffset());
        }
        this.renderView();
    }

    private createNewLine(): void {
        this.insertChar("\n");
    }

    private resetSelection(position?: EditorPosition): void {
        if (position === undefined) {
            this.model.selections.length = 0;
            this.renderView();
            return;
        }
        const offset = this.model.doc.getCharacterOffset(position.line, position.column);
        this.model.selections.length = 0;
        this.model.selections.push([ offset, offset ]);
        this.renderView();
    }

    private handleDeleteLeft(): void {
        if (this.model.selections.length > 0) {
            this.deleteSelection();
            return;
        }
        this.deleteChars(-1);
    }

    private handleDeleteRight(): void {
        if (this.model.selections.length > 0) {
            this.deleteSelection();
            return;
        }
        this.deleteChars(1);
    }

    private deleteSelection(): void {

        if (this.model.selections.length === 0) {
            return;
        }
        for (let i = 0; i < this.model.selections.length; i++) {
            const selection = this.model.selections[i];
            const caret = this.model.carets[i];
            if (selection === undefined)
                continue;
            if (caret === undefined)
                continue;
            const start = Math.min(...selection);
            const end = Math.max(...selection);
            const count = end-start;
            this.model.doc.deleteRange(start, count);
            // Moves the corresponding caret to the start
            this.model.carets[i] = start;
        }
        this.renderView();
    }

    private handleRightMoveCaret(): void {
        if (this.model.selections.length === 0) {
            this.moveCaretHorizontallyBy(1);
        }
        this.jumpSelection(1);
    }

    private handleLeftMoveCaret(): void {
        if (this.model.selections.length === 0) {
            this.moveCaretHorizontallyBy(-1);
            return;
        }
        this.jumpSelection(-1);
    }

    // Moves caret to the end if type is 1 otherwise moves it towards the back of selection
    private jumpSelection(type: 1 | -1): void {
        for (let i = 0; i < this.model.selections.length; i++) {
            const selection = this.model.selections[i];
            const carets = this.model.carets[i];
            if (!selection)
                continue;
            if (carets === undefined)
                continue;
            if (type === 1)
                // Moves the corresponding caret to the end of selection
                this.model.carets[i] = Math.max(...selection);
            else
                // Moves the corresponding caret to the start of selection
                this.model.carets[i] = Math.min(...selection);
        }
        this.renderView();
    }
}

export default EditorPresenter;