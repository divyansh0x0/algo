import { MathUtils } from "../../engine/utils";
import type { EditorPosition } from "../EditorPosition";
import { DocumentModel } from "../model/DocumentModel";
import { EditorModel } from "../model/EditorModel";
import {
    CaretMovementDirection,
    CaretMovementUnit,
    type EditorIntent,
    KeybindingService
} from "../services/events/keys/KeybindingService";


import type { EditorView } from "../view/EditorView";

class EditorPresenter {
    private readonly model: EditorModel;
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

        move: (intent) => this.handleCaretMovement(intent.direction, intent.extendsSelection ?? false, intent.unit ?? CaretMovementUnit.CHAR),
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

        const handler = this.handlers[editorIntent.type] as (intent: typeof editorIntent) => void;
        handler?.(editorIntent);
    }

    private onMouseUp() {
        this.mouseState.isDown = false;
        window.removeEventListener("mousemove", this.onMouseMoveBound);
        window.removeEventListener("mouseup", this.onMouseUpBound);
        this.renderView();
    }

    private onMouseDown(event: MouseEvent) {
        this.mouseState.isDown = true;
        this.mouseState.startX = event.clientX;
        this.mouseState.startY = event.clientY;

        const position = this.getEditorPosition(event);

        this.clampEditorPosition(position);
        this.updateCaret(position);
        this.resetSelection();
        this.ensureSelectionAnchor();
        window.addEventListener("mousemove", this.onMouseMoveBound);
        window.addEventListener("mouseup", this.onMouseUpBound);
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.mouseState?.isDown) return;

        const position = this.getEditorPosition(event);
        this.clampEditorPosition(position);
        this.updateCaret(position);
        this.updateSelection();
        this.renderView();
    }

    private getEditorPosition(event: MouseEvent) {
        return this.view.getEditorPosition(event.clientX, event.clientY);
    }

    private insertChar(text: string) {
        this.deleteSelection();
        this.resetSelection();
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

    // if dir = 1 moves caret right, if dir = -1 moves caret left and for dir=0 does not moves the caret
    private updateSelection(): void {
        for (let i = 0; i < this.model.carets.length; i++) {
            const caret = this.model.carets[i];
            if (caret === undefined)
                continue;
            this.model.selections[i]![1] = caret;
        }
        this.renderView();
    }

    private ensureSelectionAnchor(): void {
        if (this.model.selections.length !== this.model.carets.length) {
            this.model.selections.length = this.model.carets.length;
            for (let i = 0; i < this.model.carets.length; i++) {
                const caret = this.model.carets[i];
                if (caret === undefined)
                    continue;

                this.model.selections[i] = [ caret, caret ];
            }
            this.renderView();
        }
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

    private resetSelection(): void {
        this.model.selections.length = 0;
        this.renderView();
        return;
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
            const count = end - start;
            this.model.doc.deleteRange(start, count);
            // Moves the corresponding caret to the start
            this.model.carets[i] = start;
        }
        this.resetSelection();
        this.renderView();
    }

    private handleHorizontalCaretMovement(dir: -1 | 1): void {
        if (this.model.selections.length === 0) {
            this.moveCaretHorizontallyBy(dir);
        }
        this.jumpSelection(dir);
        this.resetSelection();
    }

    private handleVerticalCaretMovement(dir: -1 | 1): void {
        if (this.model.selections.length === 0) {
            this.moveCaretVerticallyBy(dir);
            return;
        }
        this.jumpSelection(dir);
        this.resetSelection();
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

    private beginSelection(): void {
        if (this.model.selections.length !== 0) {
            this.model.selections.length = 0;
        }
        for (const caret of this.model.carets) {
            this.model.selections.push([ caret, caret ]);
        }
        this.renderView();
    }

    private handleCaretMovement(direction: CaretMovementDirection, extendsSelection: boolean, unit: CaretMovementUnit): void {

        if (extendsSelection) {
            this.ensureSelectionAnchor();
        } else {
            this.resetSelection();
        }

        switch (direction) {
            case CaretMovementDirection.UP:
                this.moveCaretVerticallyBy(-1);
                break;
            case CaretMovementDirection.DOWN:
                this.moveCaretVerticallyBy(1);
                break;
            case CaretMovementDirection.LEFT:
                if (unit === CaretMovementUnit.CHAR)
                    this.moveCaretHorizontallyBy(-1);
                else
                    this.moveCaretByWord(-1);
                break;
            case CaretMovementDirection.RIGHT:
                if (unit === CaretMovementUnit.CHAR)
                    this.moveCaretHorizontallyBy(1);
                else
                    this.moveCaretByWord(1);
                break;

        }
        if (extendsSelection)
            this.updateSelection();

    }

    private moveCaretByWord(delta: -1 | 1): void {
        const wordRegex = /\w/;
        for (let i = 0; i < this.model.carets.length; i++) {
            const caret = this.model.carets[i];
            if (caret === undefined)
                continue;
            const {line, column} = this.model.doc.getLineAndColumn(caret);
            const text = this.model.doc.getLineText(line);

            let k = column;
            if (delta < 0) {
                while (k > 0 && wordRegex.test(text[k - 1]!)) k--;
            } else {
                while (k < text.length && wordRegex.test(text[k]!)) k++;
            }
            console.log(k)
            if(k === column)
                k += delta;
            const count = k-column;
            this.moveCaretHorizontallyBy(count);
        }
        this.renderView();
    }
}

export default EditorPresenter;