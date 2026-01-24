import { DocumentModel } from "../model/DocumentModel";
import { EditorModel } from "../model/EditorModel";
import EOpDeleteText from "../operations/EOpDeleteText";
import { EOpInsertText } from "../operations/EOpInsertText";
import { KeybindingService } from "../services/events/keys/KeybindingService";


import type { EditorView } from "../view/EditorView";
import { EopMergeRow } from "../operations/EopMergeRow";

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
    private model: EditorModel;
    private keybindingService = new KeybindingService();

    constructor(private view: EditorView) {
        view.onKeyUp(this.onKeyUp.bind(this));
        view.onKeyDown(this.onKeyDown.bind(this));
        view.onMouseUp(this.onMouseUp.bind(this));
        view.onMouseDown(this.onMouseDown.bind(this));

        this.doc = new DocumentModel();
        this.doc.insertText(`let x = 100;
let y = 1000;
print(x+y);
if(x > y){
    print("x is greater than y");
}
else if (x == y){
    print("x is equal to y");
}
else{
    print("x is smaller than y");
}
`);
        this.model = new EditorModel(this.doc);

        window.requestAnimationFrame(() => {
            this.view.render(this.model);
        });
    }

    private onKeyDown(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const editorIntent = this.keybindingService.resolve(event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.code, event.key);
        if (!editorIntent) return;


        switch (editorIntent.type) {
            case "insertChar":
                this.insertChar(editorIntent.text);
                break;
            case "deleteLeft":
                this.deleteChars(-1);
                break;
            case "deleteRight":
                this.deleteChars(1);
                break;
            case "newline":
                this.createNewLine();
                break;
            case "moveRight":
                this.moveCaretHorizontallyBy(1);
                break;
            case "moveLeft":
                this.moveCaretHorizontallyBy(-1);
                break;
            case "moveUp":
                this.moveCaretVerticallyBy(1);
                break;
            case "moveDown":
                this.moveCaretVerticallyBy(-1);
                break;
            default:
                console.error("Unknown editor operation", editorIntent);
                break;

        }
        this.view.render(this.model);
    }

    private onKeyUp(event: KeyboardEvent) {
    }

    private onMouseUp(event: MouseEvent) {
    }

    private onMouseDown(event: MouseEvent) {
    }

    private insertChar(text: string) {
        const carets = this.model.getCarets();
        const defaultCaret = carets.getDefaultCaret();
        this.model.getOpDispatcher().execute(new EOpInsertText(text, defaultCaret.col, defaultCaret.row));

        if (text === "\n") {
            carets.incrementRow();
            carets.setCol(0);
        } else {
            carets.moveColBy(text.length);
        }
    }

    private deleteChars(delta: number): void {
        if (delta == 0)
            return;
        const carets = this.model.getCarets();
        const defaultCaret = carets.getDefaultCaret();
        if (defaultCaret.col == 0 && defaultCaret.row == 0 && delta < 0) {
            return;
        }
        const currRowIndex = defaultCaret.row;
        const prevRowIndex = currRowIndex - 1;
        const nextRowIndex = currRowIndex + 1;

        const currLine = this.model.document.getLine(currRowIndex);
        const lineCount = this.model.document.getLineCount();

        if (delta > 0 && defaultCaret.col == currLine.length && nextRowIndex > lineCount) {
            return;
        }

        if (delta < 0) {
            const prevLine = this.model.document.getLine(prevRowIndex);
            if (defaultCaret.col == 0) {
                carets.setCol(prevLine.length);
                carets.setRow(prevRowIndex);
                this.model.getOpDispatcher().execute(new EopMergeRow(prevRowIndex, currRowIndex));
                return;
            }
            this.model.getOpDispatcher().execute(new EOpDeleteText(defaultCaret.col, currRowIndex, delta));
            carets.moveColBy(delta);
            return;
        }


        if (defaultCaret.col == currLine.length) {
            this.model.getOpDispatcher().execute(new EopMergeRow(currRowIndex, nextRowIndex));
            return;
        }
        this.model.getOpDispatcher().execute(new EOpDeleteText(defaultCaret.col, currRowIndex, delta));
    }

    private createNewLine(): void {
        const carets = this.model.getCarets();
        const col = CountChars(this.model.document.getLine(carets.getDefaultCaret().row), " ");
        const row = carets.getDefaultCaret().row + 1;
        this.model.getOpDispatcher().execute(new EOpInsertText(" ".repeat(col), 0, row));
        this.model.getCarets().incrementRow();
        this.model.getCarets().setCol(col);
    }


    //TODO: Add multi caret support
    /**
     * @param deltaCol Positive value for moving column right while negative for moving column left
     * @private
     */
    private moveCaretHorizontallyBy(deltaCol: number): void {
        const currRowIndex = this.model.getCarets().getDefaultCaret().row;
        const currColIndex: number = this.model.getCarets().getDefaultCaret().col;
        const newColIndex = currColIndex + deltaCol;
        const carets = this.model.getCarets();
        if (newColIndex < 0 && currRowIndex > 0) {
            const prevLine = this.model.document.getLine(currRowIndex - 1);
            carets.decrementRow();
            carets.setCol(prevLine.length);
            return;
        }
        const currLine = this.model.document.getLine(currRowIndex);
        if (newColIndex > currLine.length && currRowIndex < this.model.document.getLineCount() - 1) {
            carets.incrementRow();
            carets.setCol(0);
            return;
        }
        // If new column index is in bounds
        carets.setCol(Math.min(newColIndex, currLine.length));
    }

    /**
     * @param deltaRow Positive value moves caret up while negative value moves it down.
     * @private
     */
    private moveCaretVerticallyBy(deltaRow: number): void {
        const currRowIndex = this.model.getCarets().getDefaultCaret().row;
        const currColIndex: number = this.model.getCarets().getDefaultCaret().col;
        const invertedDeltaRow = (-1 * deltaRow); // Invert the delta because negative value should increase the row
        const newRowIndex = currRowIndex + invertedDeltaRow;
        const carets = this.model.getCarets();
        if (newRowIndex < 0 || newRowIndex > this.model.document.getLineCount() - 1) {
            return;
        }

        const newRowLine = this.model.document.getLine(newRowIndex);
        const newColumnIndex = Math.max(Math.min(currColIndex, newRowLine.length), 0);
        carets.setRow(newRowIndex);
        carets.setCol(newColumnIndex);
    }
}

export default EditorPresenter;