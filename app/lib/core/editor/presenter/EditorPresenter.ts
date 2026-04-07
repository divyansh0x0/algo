import { MathUtils } from "../../engine/utils";
import type { EditorPosition } from "../EditorPosition";
import { DocumentModel } from "../model/DocumentModel";
import { EditorModel } from "../model/EditorModel";
import { EditorSelection } from "../model/EditorSelection";
import { EOpIndent } from "../operations/EOpIndent";
import { EOpOutdent } from "../operations/EOpOutdent";
import {
    CaretMovementDirection,
    type EditorIntent,
    KeybindingService,
    TextUnit
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
        move: (intent) => this.handleCaretMovement(intent.direction, intent.extendsSelection ?? false, intent.unit ?? TextUnit.CHAR),

        indent: () => this.indent(),
        outdent: () => this.outdent()
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
        const editorIntent = this.keybindingService.resolve(
            event.ctrlKey,
            event.altKey,
            event.shiftKey,
            event.metaKey,
            event.code,
            event.key
        );
        console.log("Keydown", event.key, editorIntent);
        if (!editorIntent) return;
        event.stopImmediatePropagation();
        event.preventDefault();

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
        this.renderView();
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
            this.model.selections[i]!.head = caret;
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

                this.model.selections[i] = new EditorSelection(caret, caret);
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
            const start = selection.min();
            const end = selection.max();
            const count = end - start;
            this.model.doc.deleteRange(start, count);
            // Moves the corresponding caret to the start
            this.model.carets[i] = start;
        }
        this.resetSelection();
        this.renderView();
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
                this.model.carets[i] = selection.max();
            else
                // Moves the corresponding caret to the start of selection
                this.model.carets[i] = selection.min();
        }
        this.renderView();
    }

    private handleCaretMovement(direction: CaretMovementDirection, extendsSelection: boolean, unit: TextUnit): void {

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
                if (unit === TextUnit.CHAR)
                    this.moveCaretHorizontallyBy(-1);
                else
                    this.moveCaretByWord(-1);
                break;
            case CaretMovementDirection.RIGHT:
                if (unit === TextUnit.CHAR)
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
            if (k === column)
                k += delta;
            const count = k - column;
            this.moveCaretHorizontallyBy(count);
        }
        this.renderView();
    }

    private indentLines(lineStart: number, lineEnd: number, tabSize: number): void {
        const rows =[]
        for (let i = lineStart; i <= lineEnd; i++) {
            rows.push(i);
        }
        this.model.opDispatcher.execute(new EOpIndent(rows,tabSize));
    }

    private indent(): void {
        const tabSize = this.model.settings.tabSize;
        const tab = " ".repeat(tabSize);
        if (this.model.hasSelections()) {
            for (let i = 0; i < this.model.selections.length; i++) {
                const selection = this.model.selections[i];
                if (!selection)
                    continue;
                const lineStart = this.model.doc.getLineTable().findLineNumber(selection.min());
                const lineEnd = this.model.doc.getLineTable().findLineNumber(selection.max());
                const lineCount = lineEnd - lineStart + 1;
                this.indentLines(lineStart, lineEnd, tabSize);
                // Anchor sits on lineStart → shifts by exactly one tabSize.
                // Active shifts by tabSize * lineCount (every line it spans).
                if (!selection.isReversed()) {
                    selection.anchor += tabSize;
                    selection.head += tabSize * lineCount;
                } else {
                    selection.head += tabSize;
                    selection.anchor += tabSize * lineCount;
                }
                this.model.carets[i]! = selection.head;

            }
            this.renderView();
            return;
        }
        this.insertChar(tab);
    }

    private outdentLines(startRow: number, endRow: number, tabSize: number): EOpOutdent {
        const rows: number[] = [];
        for (let line = startRow; line <= endRow; line++)
            rows.push(line);
        const op = new EOpOutdent(rows, tabSize);
        this.model.opDispatcher.execute(op);
        return op;
    }

    private outdent(): void {
        const tabSize = this.model.settings.tabSize;
        if (this.model.hasSelections()) {
            for (let i = 0; i < this.model.selections.length; i++) {
                const selection = this.model.selections[i];
                if (!selection)
                    continue;
                const startRow = this.model.doc.getLineTable().findLineNumber(selection.min());
                const endRow = this.model.doc.getLineTable().findLineNumber(selection.max());
                if (!EOpOutdent.canOutdent(this.model, startRow, endRow))
                    continue;
                const op = this.outdentLines(startRow, endRow, tabSize);
                const removed = op.getOutdentedLines();
                // Each endpoint shifts left by exactly how many chars were removed
                // from the line it sits on.
                console.log(selection,removed)
                const selectionAnchorRow = this.model.doc.getLineTable().findLineNumber(selection.anchor);
                const selectionEndRow = this.model.doc.getLineTable().findLineNumber(selection.head);
                if(removed.includes(selectionAnchorRow) || removed.includes(selectionEndRow)){

                    if (!selection.isReversed()) {
                        selection.anchor -= tabSize;
                        selection.head -= tabSize * removed.length;
                    } else {
                        selection.head -= tabSize;
                        selection.anchor -= tabSize * removed.length;
                    }
                }

                this.model.carets[i] = selection.head;
            }
            this.renderView();
            return;
        }
        // No selection: outdent the line the caret is on.
        const caret = this.model.carets[0];
        if (caret === undefined) return;
        const caretLine = this.model.doc.getLineTable().findLineNumber(caret);
        if (!EOpOutdent.canOutdent(this.model, caretLine, caretLine)) return;
        const op = this.outdentLines(caretLine, caretLine, tabSize);
        for (let i = 0; i < this.model.carets.length; i++) {
            const c = this.model.carets[i];
            if (c !== undefined)
                this.model.carets[i] = Math.max(0, c - tabSize);
        }
        this.renderView();
    }

}

// private indent(): void {
//     const tabSize = this.model.settings.tabSize;
//     const tab = " ".repeat(tabSize);
//     console.log(this.model.selections);
//     if (this.model.hasSelections()) {
//     for (let i = 0; i < this.model.selections.length; i++) {
//         const selection = this.model.selections[i];
//         if (!selection)
//             continue;
//         const start = Math.min(...selection);
//         const end = Math.max(...selection);
//         const lineStart = this.model.doc.getLineTable().findLineNumber(start);
//         const lineEnd = this.model.doc.getLineTable().findLineNumber(end);
//         for (let line = lineStart; line <= lineEnd; line++) {
//             const offset = this.model.doc.getCharacterOffset(line, 0);
//             this.model.insertAt(offset, tab);
//         }
//         if(selection[0] < selection[1]){
//             selection[0] += tabSize;
//             selection[1] += tabSize * (lineEnd - lineStart);
//         }
//         else{
//             selection[1] += tabSize;
//             selection[0] += tabSize * (lineEnd - lineStart + 1);
//         }
//         for (let j = 0; j < this.model.carets.length; j++) {
//             if (this.model.carets[j] !== undefined) {
//                 this.model.carets[j]! += tabSize;
//             }
//         }
//     }
//
//     this.renderView();
//     return;
// }
// this.insertChar(tab);
// }
export default EditorPresenter;