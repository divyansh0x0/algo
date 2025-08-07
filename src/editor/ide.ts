import * as Editor     from "@/editor/index";
import { KeyCodes }    from "@/editor/index";
import { StringUtils } from "@/utils/stringutils";
import { Vmath }       from "@/utils/vmath";
import * as YASL       from "@/yasl";
import { Token }       from "@/yasl";


function getMonospaceCharBox(el: HTMLElement) {
    // Set of chars to test ascenders/descenders/full caps
    const testChars = "MWXgyjq";

    const span          = document.createElement("span");
    span.textContent    = testChars;
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";

    // Copy font styling from the div
    const computed        = window.getComputedStyle(el);
    span.style.font       = computed.font;
    span.style.fontSize   = computed.fontSize;
    span.style.fontFamily = computed.fontFamily;
    span.style.letterSpacing = computed.letterSpacing;
    span.style.fontWeight = computed.fontWeight;
    span.style.lineHeight = computed.lineHeight;

    document.body.appendChild(span);
    const rect = span.getBoundingClientRect();
    document.body.removeChild(span);

    console.log("Calculating font metrics for", span.style.fontFamily);
    const charWidth = rect.width / testChars.length;
    const charHeight = rect.height;

    return {
        width: charWidth,
        height: charHeight
    };
}

class CaretManager {
    private readonly spawned_carets: YASLCaret[]                     = [];
    private is_typing_timer_id: ReturnType<typeof setTimeout> | null = null;

    private readonly primary_caret: YASLCaret;

    private _char_width                                              = 0;

    get char_width(): number {
        return this._char_width;
    }

    private _line_height                                             = 0;

    get line_height(): number {
        return this._line_height;
    }

    constructor(parent: HTMLElement, private primary_row: EditorRow) {
        this.primary_caret = new YASLCaret(parent);

    }

    moveCol(delta: number): void {
        const max_col = this.primary_row.raw.length;
        const new_col = Vmath.clamp(this.primary_caret.column + delta, 0, max_col);
        this.primary_caret.setColumn(new_col);
        this.primary_row.setColumn(new_col);
        this.restartTypingTimer();
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
        this.restartTypingTimer();
    }

    setRow(new_row: EditorRow): void {
        this.primary_row = new_row;

        const max_col = this.primary_row.raw.length;
        const new_col = Vmath.clamp(this.primary_caret.column, 0, max_col);
        this.primary_row.setColumn(new_col);
        this.primary_caret.setColumn(new_col);
        this.primary_caret.setRow(this.primary_row.getDomNode());
        this.restartTypingTimer();
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

    private restartTypingTimer() {
        if (this.is_typing_timer_id)
            clearTimeout(this.is_typing_timer_id);
        this.primary_caret.typing = true;
        this.is_typing_timer_id   = setTimeout(() => {
            this.primary_caret.typing = false;
        }, 1000);
    }
}

class YASLCaret {

    private row_el: HTMLElement | null = null;

    private readonly caret = document.createElement("div");

    private char_width  = 10;

    private _column          = 0;

    get column(): number {
        return this._column;
    }
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

}

export class EditorRow {
    private insertion_col                 = 0;
    private selection_range: Range | null = null;

    constructor(private ide: IDE, private row_el: HTMLElement) {
        this.row_el.classList.add("yasl-editor-row");
        this.row_el.tabIndex = 0;

        this.row_el.onfocus     = (e) => {
            ide.setActiveRow(this);
        };
        this.row_el.onmousedown = (e) => {
            this.ide.setActiveRow(this);
            if (e.detail === 1) {
                const rect = this.row_el.getBoundingClientRect();
                if (!rect)
                    return;
                const col = Math.floor((e.clientX - rect.x) / this.ide.caret_manager.char_width);
                this.ide.caret_manager.setColumn(col);


                const sel = window.getSelection();
                if (sel && this.selection_range) {
                    // Ensure the range still belongs to the current selection
                    for (let i = 0; i < sel.rangeCount; i++) {
                        if (sel.getRangeAt(i) === this.selection_range) {
                            sel.removeRange(this.selection_range);
                            break;
                        }
                    }
                    this.selection_range = null;
                }
                this.focus();
            } else if (e.detail === 2) {
                this.selectWord(e.clientX, e.clientY);
            } else {
                this.selectRow();
            }
            e.preventDefault();
        };

        this.row_el.onkeydown = (e) => {
            this.handleKeyPress(e.key);
            e.preventDefault();
            e.stopImmediatePropagation();
        };
    }

    private _tokens: YASL.Token[]         = [];

    get tokens(): Token[] {
        return this._tokens;
    }

    private set tokens(value: Token[]) {
        this._tokens = value;
    }

    private _raw: string = "";

    // private readonly editor_content_el = document.createElement("div");

    get raw(): string {
        return this._raw;
    }

    handleKeyPress(key: string) {
        switch (key) {
            case Editor.KeyCodes.Backspace:
                this.backspaceChar();
                break;
            case Editor.KeyCodes.Delete:
                this.deleteChar();
                break;
            case Editor.KeyCodes.Home:
                this.goToStart();
                break;
            case Editor.KeyCodes.End:
                this.goToEnd();
                break;
            case KeyCodes.Enter:
                this.ide.insertRowAfterCurrent();
                break;

            case KeyCodes.ARROW_LEFT:
                this.ide.caret_manager.moveCol(-1);
                break;

            case KeyCodes.ARROW_RIGHT:
                this.ide.caret_manager.moveCol(1);
                break;
            case KeyCodes.ARROW_DOWN:
                this.ide.moveDown();
                break;
            case KeyCodes.ARROW_UP:
                this.ide.moveUp();
                break;
            case KeyCodes.Tab:
                if (this.ide.tab_spaces_count > 0)
                    this.appendChar(" ".repeat(this.ide.tab_spaces_count));
                else
                    this.appendChar("\t");
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

    render() {
        const raw_text    = this.raw;
        const tokens      = new YASL.Lexer(raw_text).getTokens();
        let rendered_text = "";
        let last_end_index = 0;
        if (tokens.length > 0) {
            for (const token of tokens) {
                if (token.type === YASL.TokenType.EOF)
                    break;
                // if (last_end_index !== token.start) {
                //     rendered_text += `<span class='whitespace'>${ raw_text.slice(last_end_index, token.start)
                // }</span>`; }

                rendered_text += `<span class='${ YASL.StringifyTokenType(token.type) }'>${ raw_text.slice(token.start, token.end) }</span>`;
                last_end_index = token.end;
            }
        } else {
            rendered_text = raw_text;
        }
        // const rect = getContentRect(this.input_text);

        // this.caret.style.left =  rect.x.toString() + "px";

        this.row_el.innerHTML = rendered_text;
        this._tokens      = tokens;
    }

    goToStart(): void {
        const leading_whitespace_length = StringUtils.countLeadingWhitespaces(this.raw);
        this.ide.caret_manager.setColumn(leading_whitespace_length);
    }

    goToEnd(): void {
        const trailing_whitespace_length = StringUtils.countTrailingWhitespaces(this.raw);
        this.ide.caret_manager.setColumn(this.raw.length - trailing_whitespace_length);
    }

    private appendChar(char: string): void {
        if (this.insertion_col === this.raw.length) {
            this._raw += char;
        } else if (this.insertion_col < this.raw.length) {
            this._raw = this.raw.slice(0, this.insertion_col) + char + this.raw.slice(this.insertion_col);
        }
        this.ide.caret_manager.moveCol(char.length);
        this.render();
    }

    clear(): void {
        this._raw = "";
    }

    getRowHeight(): number {
        return this.row_el.offsetHeight;
    }

    focus(): void {
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

    private backspaceChar(): void {
        if (this._raw.length == 0) {
            this.ide.deleteActiveRow();
            return;
        }
        if (this.insertion_col == 0) {
            return;
        }
        if (this.selection_range) {
            this.clearSelection();
        } else {
            const start_str = this.raw.slice(0, this.insertion_col);
            // delete pure leading whitespace
            if (start_str.match(/^\s*$/)) {
                this._raw = this.raw.slice(this.insertion_col, this.raw.length);
                this.ide.caret_manager.setColumn(0);
            } else {
                this._raw = this.raw.slice(0, this.insertion_col - 1) + this.raw.slice(this.insertion_col, this.raw.length);
                this.ide.caret_manager.moveCol(-1);
            }
        }
        this.render();

    }

    private deleteChar(): void {
        if (this.selection_range) {
            this.clearSelection();
        } else if (this._raw.length > 0 && this.insertion_col < this.raw.length) {
            this._raw = this._raw.slice(0, this.insertion_col) + this.raw.slice(this.insertion_col + 1, this.raw.length);
            // this.ide.caret_manager.moveCol();
        } else
            return;
        this.render();
    }

    private selectWord(x: number, y: number): void {
        if (this.selection_range)
            window.getSelection()?.removeRange(this.selection_range);
        for (const child of this.row_el.children) {
            const rect = child.getBoundingClientRect();
            const padY = 0;
            if (x > rect.x && x < rect.x + rect.width
                && y > rect.y - padY && y < rect.y + rect.height + padY) {
                const range = document.createRange();
                range.selectNodeContents(child);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
                this.selection_range = range;
                this.ide.caret_manager.moveColToWordEnd();
                break;
            }
        }
    }

    private selectRow(): void {
        const range = document.createRange();
        range.selectNodeContents(this.row_el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        this.selection_range = range;
        this.ide.caret_manager.setColumn(-1);
    }

    private clearSelection(): void {
        if (!this.selection_range)
            return;
        const selection_length = this.selection_range.toString().length;

        const selection_start_pos = this.insertion_col - selection_length;
        const selection_end_pos   = this.insertion_col;

        this._raw = this.raw.slice(0, selection_start_pos) + this.raw.slice(selection_end_pos, this.raw.length);
        this.ide.caret_manager.moveCol(-selection_length);
        this.selection_range = null;

    }
}

export class IDE {
    public readonly caret_manager;
    private readonly editor_rows: EditorRow[] = [];
    public readonly tab_spaces_count      = 4;
    private readonly editor_el            = document.createElement("div");
    private row_height: number            = 10;

    constructor(parent: HTMLElement) {
        parent.append(this.editor_el);
        // this.editor_el.tabIndex = 0;
        this.editor_el.classList.add("yasl-editor");

        const loader = document.createElement("div");
        loader.classList.add("yasl-ide-loader");
        loader.innerText = "loading";
        this.editor_el.appendChild(loader);
        this.appendRow();
        this.caret_manager = new CaretManager(this.editor_el, this.editor_rows[this.active_row_index]);
        this.editor_el.onmousedown = (e) => {
            this.editor_rows[this.active_row_index]?.focus();
            e.preventDefault();
        };
        this.initialize().then(() => {
            this.editor_el.classList.add("ready");
        });
    }

    private _active_row_index = 0;

    get active_row_index(): number {
        return this._active_row_index;
    }

    set active_row_index(new_row_index: number) {
        const new_index = Vmath.clamp(new_row_index, 0, this.editor_rows.length - 1);
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

    moveUp(): void {
        this.active_row_index--;
    }

    private appendRow(): void {
        const row_el = document.createElement("div");
        this.editor_rows.push(new EditorRow(this, row_el));
        this.editor_el.appendChild(row_el);
    }

    moveDown(): void {
        this.active_row_index++;
    }

    deleteActiveRow(): void {
        if (this.active_row_index == 0)
            return; //cant delete the 0th row

        const curr_row = this.editor_rows[this.active_row_index];
        this.editor_rows.splice(this.active_row_index, 1);
        this.editor_el.removeChild(curr_row.getDomNode());
        this.active_row_index--;
        const new_active_row = this.editor_rows[this.active_row_index];
        this.caret_manager.setColumn(new_active_row.raw.length);
    }

    private async initialize(): Promise<void> {
        await document.fonts.ready;
        const computed = window.getComputedStyle(this.editor_el);
        const fontStr  = `${ computed.fontSize } ${ computed.fontFamily }`;
        await document.fonts.load(fontStr);
        // Wait one frame to ensure font is rendered before measuring
        await new Promise(requestAnimationFrame);
        const char_box = getMonospaceCharBox(this.editor_el);
        const new_height = char_box.height;
        for (const row of this.editor_rows) {
            row.setHeight(new_height);
        }
        this.caret_manager.setFontMetrics(char_box.width, char_box.height);
        this.row_height = new_height;
    }
}
