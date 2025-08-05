import * as Editor from "@/editor/index";
import { KeyCodes } from "@/editor/index";
import { Vmath } from "@/utils/vmath";
import * as YASL from "@/yasl";
import { YASLNode } from "@/yasl";

function getMonospaceCharBox(el: HTMLElement) {
    // Set of chars to test ascenders/descenders/full caps
    const testChars = "MWXgyjq";

    const span = document.createElement("span");
    span.textContent = testChars;
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";

    // Copy font styling from the div
    const computed = window.getComputedStyle(el);
    span.style.font = computed.font;
    span.style.fontSize = computed.fontSize;
    span.style.fontFamily = computed.fontFamily;
    span.style.letterSpacing = computed.letterSpacing;
    span.style.fontWeight = computed.fontWeight;
    span.style.lineHeight = computed.lineHeight;

    document.body.appendChild(span);
    const rect = span.getBoundingClientRect();
    document.body.removeChild(span);

    const charWidth = rect.width / testChars.length;
    const charHeight = rect.height;

    return {
        width: charWidth,
        height: charHeight
    };
}

class CaretManager {
    private readonly primary_caret: YASLCaret;
    private readonly spawned_carets: YASLCaret[] = [];

    constructor(parent: HTMLElement, private primary_row: EditorRow) {
        this.primary_caret = new YASLCaret(parent);

    }

    moveCol(delta: number): void {
        const max_col = this.primary_row.raw.length + 1;
        const new_col = Vmath.clamp(this.primary_caret.column + delta, 0, max_col);
        this.primary_caret.setColumn(new_col);
        this.primary_row.setColumn(new_col);
        console.log(new_col);
    }

    setRow(new_row: EditorRow): void {
        this.primary_row = new_row;

        const max_col = this.primary_row.raw.length;
        const new_col = Vmath.clamp(this.primary_caret.column, 0, max_col);
        // this.primary_row.setCaret(this.primary_caret);
        console.log(new_col);
        this.primary_row.setColumn(new_col);
        this.primary_caret.setColumn(new_col);
        this.primary_caret.setRow(this.primary_row.getDomNode());
    }

    setFontMetrics(char_width: number, line_height: number) {
        this.primary_caret.setCharWidth(char_width);
        this.primary_caret.setLineHeight(line_height);
    }
}

class YASLCaret {
    private row_el: HTMLElement | null = null;

    private readonly caret = document.createElement("div");

    private _column = 0;

    get column(): number {
        return this._column;
    }
    private char_width = 10;
    private line_height = 10;
    private text_before_caret = "";

    constructor(private parent: HTMLElement) {
        this.caret.classList.add("caret");
        parent.append(this.caret);
        parent.style.position = "relative";
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
            this.caret.style.top = (this.row_el.offsetTop).toString() + "px";
            this.caret.style.left = (this._column * this.char_width).toString() + "px";
        }
    }


    moveBy(value: number): void {
        this._column = Math.max(this._column + value, 0);

        this.updateCaretPosition();
    }

    setLineHeight(line_height: number): void {
        this.line_height = line_height;
        this.caret.style.height = this.line_height + "px";
    }

    setCharWidth(char_width: number): void {
        this.char_width = char_width;
    }
}

export class EditorRow {
    private insertion_col = 0;
    private readonly tokens: YASLNode[] = [];

    constructor(private ide: IDE, private row_el: HTMLElement) {
        this.row_el.classList.add("yasl-editor-row");
        this.row_el.tabIndex = 0;

        this.row_el.onfocus = (e) => {
            ide.setActiveRow(this);
        };
        this.row_el.onmousedown = (e) => {
            this.ide.setActiveRow(this);
            this.focus();

        };

        this.row_el.onkeydown = (e) => {
            this.handleKeyPress(e.key);
            e.preventDefault();
            e.stopImmediatePropagation();
        };
    }

    private _raw: string = "";

    // private readonly editor_content_el = document.createElement("div");

    get raw(): string {
        return this._raw;
    }

    handleKeyPress(key: string) {
        switch (key) {
            case Editor.KeyCodes.Backspace:
                this.deleteChar();
                break;
            case KeyCodes.Enter:
                this.ide.insertRowAfterCurrent();
                console.log("IDE ");
                break;
            default:
                if (Editor.isPrintableKey(key)) {
                    this.appendChar(key);
                } else {
                    console.log("unknown key handing over to IDE:", key);
                }
                break;
        }
    }

    appendChar(char: string): void {
        this.ide.caret_manager.moveCol(1);
        console.log(this.insertion_col, this.raw.length);
        if (this.insertion_col === this.raw.length + 1) {
            this._raw += char;
        } else if (this.insertion_col < this.raw.length) {
            this._raw = this.raw.slice(0, this.insertion_col) + char + this.raw.slice(this.insertion_col);
        }
        this.render();
    }

    deleteChar(): void {
        if (this._raw.length > 0) {
            this._raw = this._raw.slice(0, this.insertion_col - 1) + this.raw.slice(this.insertion_col);
            this.ide.caret_manager.moveCol(-1);
            this.render();
        }
    }

    render() {
        const raw_text = this.raw;
        const tokens = new YASL.Lexer(raw_text).getTokens();
        let rendered_text = "";
        let last_end_index = 0;
        if (tokens.length > 0) {
            for (const token of tokens) {
                if (token.type === YASL.TokenType.EOF)
                    break;
                if (last_end_index !== token.start) {
                    rendered_text += `<span class='whitespace'>${ raw_text.slice(last_end_index, token.start) }</span>`;
                }

                rendered_text += `<span class='${ YASL.StringifyTokenType(token.type) }'>${ raw_text.slice(token.start, token.end) }</span>`;
                last_end_index = token.end;
            }
        } else {
            rendered_text = raw_text;
        }
        // const rect = getContentRect(this.input_text);


        // this.caret.style.left =  rect.x.toString() + "px";

        this.row_el.innerHTML = rendered_text;
    }

    clear(): void {
        this._raw = "";
    }

    getRowHeight(): number {
        return this.row_el.offsetHeight;
    }

    focus(): void {
        // this.row_el.classList.add("active");
        this.row_el.focus();
    }

    deactivate() {
        // this.row_el.classList.remove("active");
    }


    setHeight(new_height: number) {
        this.row_el.style.height = new_height + "px";
    }

    getDomNode(): HTMLElement {
        return this.row_el;
    }

    setColumn(column: number): void {
        this.insertion_col = column;
    }
}

export class IDE {
    public readonly caret_manager;
    private readonly editor_rows: EditorRow[] = [];
    private readonly editor_el = document.createElement("div");
    private row_height: number = 10;

    constructor(parent: HTMLElement) {
        parent.append(this.editor_el);
        // this.editor_el.tabIndex = 0;
        this.editor_el.classList.add("yasl-editor");

        this.appendRow();
        this.caret_manager = new CaretManager(this.editor_el, this.editor_rows[this.active_row_index]);
        const observer = new MutationObserver(() => {
            console.log("Font family changed to:", window.getComputedStyle(parent).fontFamily);
            this.updateRowHeight();
        });

        this.updateRowHeight();
        observer.observe(this.editor_el, {
            attributes: true,
            attributeFilter: [ "style", "class" ]
        });
        this.editor_el.onmousedown = (e) => {
            this.editor_rows[this.active_row_index]?.focus();
            e.preventDefault();
        };
    }

    private _active_row_index = 0;

    get active_row_index(): number {
        return this._active_row_index;
    }

    set active_row_index(new_row_index: number) {
        const new_index = Vmath.clamp(new_row_index, 0, this.editor_rows.length);
        const new_editor_row = this.editor_rows[new_index];
        new_editor_row.focus();

        this.caret_manager.setRow(new_editor_row);
        this._active_row_index = new_index;
    }

    insertRowAfter(index: number): void {
        const old_row = this.editor_rows[index].getDomNode();
        const row_el = document.createElement("div");
        const new_row = new EditorRow(this, row_el);
        new_row.setHeight(this.row_height);
        this.editor_rows.splice(index + 1, 0, new_row);

        old_row.insertAdjacentElement("afterend", row_el);

        this.active_row_index = index + 1;
    }

    insertRowAfterCurrent(): void {
        this.insertRowAfter(this.active_row_index);
    }

    setActiveRow(row: EditorRow): void {
        this.active_row_index = this.editor_rows.indexOf(row);
    }

    private updateRowHeight(): void {
        const char_box = getMonospaceCharBox(this.editor_el);
        const new_height = char_box.height;
        for (const row of this.editor_rows) {
            row.setHeight(new_height);
        }
        this.caret_manager.setFontMetrics(char_box.width, char_box.height);
        this.row_height = new_height;
    }

    private appendRow(): void {
        const row_el = document.createElement("div");
        this.editor_rows.push(new EditorRow(this, row_el));
        this.editor_el.appendChild(row_el);
    }
}
