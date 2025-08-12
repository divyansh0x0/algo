import { IDERow } from "@/editor/ide";
import { Vmath }  from "@/utils/vmath";

export class CaretManager {
    private readonly spawned_carets: YASLCaret[]                     = [];
    private is_typing_timer_id: ReturnType<typeof setTimeout> | null = null;

    private readonly primary_caret: YASLCaret;

    constructor(parent: HTMLElement, private primary_row: IDERow) {
        this.primary_caret = new YASLCaret(parent);

    }

    private _char_width = 0;

    get char_width(): number {
        return this._char_width;
    }

    private _line_height = 0;

    get line_height(): number {
        return this._line_height;
    }

    moveCol(delta: number): void {
        const max_col = this.primary_row.raw.length;
        const new_col = Vmath.clamp(this.primary_caret.column + delta, 0, max_col);
        this.primary_caret.setColumn(new_col);
        this.primary_row.setColumn(new_col);
        this.posChanged();
    }

    setColumn(col: number) {
        const max_col = this.primary_row.raw.length;
        let new_col: number;
        if (col >= 0)
            new_col = Vmath.clamp(col, 0, max_col);
        else
            new_col = Vmath.clamp(max_col - col + 1, 0, max_col);
        this.primary_caret.setColumn(new_col);
        this.primary_row.setColumn(new_col);
        this.posChanged();
    }

    setRow(new_row: IDERow): void {
        this.primary_row = new_row;

        const max_col = this.primary_row.raw.length;
        const new_col = Vmath.clamp(this.primary_caret.column, 0, max_col);
        this.primary_row.setColumn(new_col);
        this.primary_caret.setColumn(new_col);
        this.primary_caret.setRow(this.primary_row.getDomNode());
        this.posChanged();
    }

    setFontMetrics(char_width: number, line_height: number) {
        this.primary_caret.setCharWidth(char_width);
        this.primary_caret.setLineHeight(line_height);
        console.log("IDE Font metrics updated from", this._char_width, "to", char_width);
        this._char_width  = char_width;
        this._line_height = line_height;
        this.primary_caret.updateCaretPosition();
    }

    moveColToWordEnd(): void {
        const tokens = this.primary_row.tokens;
        const col    = this.primary_caret.column;

        for (const token of tokens) {
            // left to right lexical parsing means we do not need to check if col > token.start
            if (col < token.end) {
                this.setColumn(token.end);
                break;
            }
        }
    }

    isAtEnd(): boolean {
        return this.primary_caret.column === this.primary_row.raw.length;
    }

    isAtStart(): boolean {
        return this.primary_caret.column === 0;
    }

    posChanged() {
        if (this.is_typing_timer_id)
            clearTimeout(this.is_typing_timer_id);
        this.primary_caret.typing = true;
        this.is_typing_timer_id   = setTimeout(() => {
            this.primary_caret.typing = false;
        }, 1000);

    }
}

export class YASLCaret {

    private row_el: HTMLElement | null = null;

    private readonly caret = document.createElement("div");

    private char_width = 10;
    private line_height       = 10;
    private text_before_caret = "";

    constructor(private parent: HTMLElement) {
        this.caret.classList.add("caret");
        parent.append(this.caret);
        parent.style.position = "relative";
    }

    private _column = 0;

    get column(): number {
        return this._column;
    }

    private _typing: boolean = false;

    get typing(): boolean {
        return this._typing;
    }

    set typing(value: boolean) {
        this._typing = value;
        if (value) {
            this.caret.classList.add("typing");
        } else
            this.caret.classList.remove("typing");
    }

    setRow(new_row: HTMLElement) {
        this.row_el = new_row;
        this.updateCaretPosition();
    }

    setColumn(new_col: number) {
        this._column = new_col;
        this.updateCaretPosition();
    }

    updateCaretPosition() {
        if (this.row_el) {
            this.caret.style.top  = (this.row_el.offsetTop).toString() + "px";
            this.caret.style.left = (this._column * this.char_width).toString() + "px";
        }
    }

    moveBy(value: number): void {
        this._column = Math.max(this._column + value, 0);

        this.updateCaretPosition();
    }

    setLineHeight(line_height: number): void {
        this.line_height        = line_height;
        this.caret.style.height = this.line_height + "px";
    }

    setCharWidth(char_width: number): void {
        this.char_width = char_width;
    }

}
