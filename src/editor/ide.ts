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

    private _char_width = 0;

    get char_width(): number {
        return this._char_width;
    }

    private _line_height = 0;

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

    setRow(new_row: EditorRow): void {
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

    private posChanged() {
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

    private char_width = 10;

    private _column = 0;

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

function isInBounds(x: number, y: number, rect: DOMRect): any {
    return x > rect.x
        && x < rect.x + rect.width
        && y > rect.y
        && y < rect.y + rect.height;
}

export class EditorRow {
    private insertion_col            = 0;

    constructor(private ide: IDE, private row_el: HTMLElement) {
        this.row_el.classList.add("yasl-editor-row");
    }

    private _tokens: YASL.Token[] = [];

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


    render() {
        const raw_text    = this.raw;
        const tokens      = new YASL.Lexer(raw_text).getTokens();
        let rendered_text = "";
        if (tokens.length > 0) {
            for (const token of tokens) {
                if (token.type === YASL.TokenType.EOF)
                    break;
                rendered_text += `<span class='${ YASL.StringifyTokenType(token.type) }'>${ raw_text.slice(token.start, token.end) }</span>`;
            }
        } else {
            rendered_text = raw_text;
        }
        this.row_el.innerHTML = rendered_text;
        this._tokens = tokens;
    }

    goToStart(): void {
        const leading_whitespace_length = StringUtils.countLeadingWhitespaces(this.raw);
        this.ide.caret_manager.setColumn(leading_whitespace_length);
    }

    goToEnd(): void {
        const trailing_whitespace_length = StringUtils.countTrailingWhitespaces(this.raw);
        this.ide.caret_manager.setColumn(this.raw.length - trailing_whitespace_length);
    }

    appendStr(str: string): void {
        if (this.insertion_col === this.raw.length) {
            this._raw += str;
        } else if (this.insertion_col < this.raw.length) {
            this._raw = this.raw.slice(0, this.insertion_col) + str + this.raw.slice(this.insertion_col);
        }
        this.render();
    }

    clear(): void {
        this._raw = "";
    }

    getRowHeight(): number {
        return this.row_el.offsetHeight;
    }

    activate(): void {
        this.row_el.classList.add("active");
    }

    deactivate() {
        this.row_el.classList.remove("active");
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

    backspaceChar(): void {
        if (this.insertion_col === 0) {
            return;
        }
        const start_str = this.raw.slice(0, this.insertion_col);
        // delete pure leading whitespace
        if (start_str.match(/^\s*$/)) {
            this._raw = this.raw.slice(this.insertion_col, this.raw.length);
            this.ide.caret_manager.setColumn(0);
        } else {
            this._raw = this.raw.slice(0, this.insertion_col - 1) + this.raw.slice(this.insertion_col, this.raw.length);
            this.ide.caret_manager.moveCol(-1);
        }

        console.log("backspace", this.raw);
        this.render();

    }

    removeStr(start: number, end: number = -1) {
        if (start === 0 && (end === this.raw.length || end === -1)) {
            this._raw = "";
        }
        if (start >= 0 && end >= 0 && start !== end) {
            const left  = this.raw.slice(0, start);
            const right = this.raw.slice(end, this.raw.length);
            this._raw   = left + right;
        } else if (start > 0 && end < 0) {
            const corrected_end = this.raw.length + end + 1;
            const left          = this.raw.slice(0, start);
            const right         = this.raw.slice(corrected_end, this.raw.length);
            this._raw           = left + right;
        }
        this.render();
    }

    deleteChar(): void {
        if (this._raw.length > 0 && this.insertion_col < this.raw.length) {
            this._raw = this.raw.slice(0, this.insertion_col) + this.raw.slice(this.insertion_col + 1, this.raw.length);
            this.render();
        }
    }

    selectWord(x: number, y: number): void {
        this.row_el.getBoundingClientRect();
        for (const child of this.row_el.children) {
            const rect = child.getBoundingClientRect();
            if (isInBounds(x, y, rect)) {
                const start_x = rect.x;
                const end_x   = rect.x + rect.width;

                const anchor_col = this.ide.getColumnFromPoint(start_x);
                const head_col   = this.ide.getColumnFromPoint(end_x);

                this.ide.selection.setAnchor(anchor_col, this.ide.active_row_index);
                this.ide.selection.moveHead(head_col, this.ide.active_row_index);
                break;
            }
        }
    }

    selectRow(): void {
        this.ide.selection.setAnchor(0, this.ide.active_row_index);
        this.ide.selection.moveHead(this.raw.length, this.ide.active_row_index);
    }

    setText(row_str: string): void {
        this._raw = row_str;
        this.render();
    }

    canBeDeleted(): boolean {
        return this.raw.length === 0 || StringUtils.isWhitespace(this.raw);
    }
}

interface IDEPosition {
    line: number,
    col: number,
}

class IDESelection {
    private readonly anchor: IDEPosition = {
        line: 0,
        col : 0
    };
    private readonly head: IDEPosition   = {
        line: 0,
        col : 0
    };


    private anchor_el = document.createElement("div");
    private middle_el = document.createElement("div");
    private head_el   = document.createElement("div");

    constructor(parent: HTMLElement, private ide: IDE) {
        parent.append(this.anchor_el, this.middle_el, this.head_el);

        this.anchor_el.classList.add("yasl-ide-selection-el");
        this.middle_el.classList.add("yasl-ide-selection-el");
        this.head_el.classList.add("yasl-ide-selection-el");
    }

    moveHead(col: number, row: number): void {
        this.head.line = row;
        this.head.col  = col;

        this.render();
    }

    setAnchor(col: number, row: number): void {
        this.clear();
        const max_col    = this.ide.getMaxColumn(row);
        this.anchor.col  = Math.min(col, max_col);
        this.anchor.line = row;
    }

    clear(): void {
        this.head.col  = 0;
        this.head.line = 0;

        this.anchor.col  = 0;
        this.anchor.line = 0;

        this.anchor_el.style = "";
        this.middle_el.style = "";
        this.head_el.style   = "";
    }

    isSelected(): boolean {
        const style_value = this.anchor_el.getAttribute("style");
        if (typeof style_value === "string") {
            return style_value.length > 0;
        } else {
            return false;
        }
    }

    getStart() {
        if (this.anchor.line === this.head.line) {
            return this.anchor.col < this.head.col ? this.anchor : this.head;
        } else {
            return this.anchor.line < this.head.line ? this.anchor : this.head;
        }
    }

    getEnd() {
        if (this.anchor.line === this.head.line) {
            return this.anchor.col < this.head.col ? this.head : this.anchor;
        } else {
            return this.anchor.line < this.head.line ? this.head : this.anchor;
        }
    }

    private render() {
        if (this.head.col === this.anchor.col && this.head.line === this.anchor.line) {
            this.anchor_el.style = "";
            this.middle_el.style = "";
            this.head_el.style   = "";

            return;
        }
        const char_width  = this.ide.caret_manager.char_width;
        const line_height = this.ide.caret_manager.line_height;
        const line_width  = this.ide.rect.width;


        this.anchor_el.style.height = line_height + "px";
        this.anchor_el.style.top    = this.anchor.line * line_height + "px";

        if (this.head.line === this.anchor.line) {
            let min_col: number;
            let max_col: number;
            if (this.head.col > this.anchor.col) {
                min_col = this.anchor.col;
                max_col = this.head.col;
            } else {
                min_col = this.head.col;
                max_col = this.anchor.col;
            }
            const col_diff = max_col - min_col;

            this.anchor_el.style.left  = min_col * char_width + "px";
            this.anchor_el.style.width = col_diff * char_width + "px";

            this.middle_el.style = "";
            this.head_el.style   = "";

            this.ide.active_row_index = this.head.line;
            this.ide.caret_manager.setColumn(this.head.col);

            return;
        }

        let min_line: number;
        //up to down selection
        if (this.anchor.line < this.head.line) {
            this.anchor_el.style.width = (line_width - this.anchor.col * char_width) + "px";
            this.anchor_el.style.left  = this.anchor.col * char_width + "px";
            this.head_el.style.left    = "0";
            this.head_el.style.width   = this.head.col * char_width + "px";
            min_line                   = this.anchor.line;
        } else {
            //down to up selection
            this.anchor_el.style.width = this.anchor.col * char_width + "px";
            this.anchor_el.style.left  = "0";
            this.head_el.style.left  = this.head.col * char_width + "px";
            this.head_el.style.width = (line_width - this.head.col * char_width) + "px";
            min_line                   = this.head.line;
        }

        const line_gap = Math.abs(this.head.line - this.anchor.line) - 1;
        if (line_gap !== 0) {
            this.middle_el.style.left   = "0";
            this.middle_el.style.top    = (min_line + 1) * line_height + "px";
            this.middle_el.style.width  = line_width + "px";
            this.middle_el.style.height = line_gap * line_height + "px";
        } else {
            this.middle_el.style = "";
        }


        this.head_el.style.top    = this.head.line * line_height + "px";
        this.head_el.style.height = line_height + "px";

    }
}

export class IDE {
    public readonly caret_manager: CaretManager;
    public readonly tab_spaces_count = 4;
    public readonly rect                      = new DOMRect();
    private readonly editor_rows: EditorRow[] = [];

    private readonly gutter_el = document.createElement("div");
    private readonly editor_el = document.createElement("div");
    public selection = new IDESelection(this.editor_el, this);
    private is_mouse_down      = false;
    private row_height: number = 10;
    private char_width: number = 10;
    private _active_row_index = 0;

    constructor(parent: HTMLElement, private gutter_enabled = true) {
        const editor_wrapper = document.createElement("div");
        editor_wrapper.append(this.gutter_el, this.editor_el);
        editor_wrapper.classList.add("yasl-editor-wrapper");
        parent.append(editor_wrapper);

        this.editor_el.tabIndex = 1;
        this.editor_el.classList.add("yasl-editor");
        this.gutter_el.classList.add("yasl-editor-gutter");

        const loader = document.createElement("div");
        loader.classList.add("yasl-ide-loader");
        loader.innerText = "loading";
        this.editor_el.appendChild(loader);

        this.editor_el.onmousedown = (e) => {
            switch (e.detail) {
                case 1:
                    const row = this.getRowFromPoint(e.clientY);
                    this.active_row_index = row;
                    const col = this.getColumnFromPoint(e.clientX);
                    this.caret_manager.setColumn(col);
                    this.selection.setAnchor(col, row);
                    this.is_mouse_down = true;
                    break;
                case 2:
                    this.editor_rows[this.active_row_index]?.selectWord(e.clientX, e.clientY);
                    break;
                default:
                    this.editor_rows[this.active_row_index]?.selectRow();
                    break;
            }


            this.editor_el.focus();
            e.preventDefault();
        };

        this.initialize().then(() => {
            this.editor_el.classList.add("ready");
        });

        this.editor_el.onkeydown = (e) => {
            this.handleKeyPress(e.key);
            e.preventDefault();
            e.stopImmediatePropagation();
        };

        window.addEventListener("mouseup", () => {
            this.is_mouse_down = false;
        });

        window.addEventListener("mousemove", (e) => {
            if (!this.is_mouse_down) return;
            // Selection logic placeholder

            const col = this.getColumnFromPoint(e.clientX);
            const row = this.getRowFromPoint(e.clientY);
            this.selection.moveHead(col, row);
            this.active_row_index = row;
            this.caret_manager.setColumn(col);
        });


        this.caret_manager = new CaretManager(this.editor_el, this.editor_rows[this.active_row_index]);

        window.addEventListener("resize", () => this.updateIdeRect());

        const resize_observer = new ResizeObserver(() => {
            this.updateIdeRect();
        });
        resize_observer.observe(this.editor_el);

    }

    get active_row_index(): number {
        return this._active_row_index;
    }

    set active_row_index(new_row_index: number) {
        const old_editor_row = this.editor_rows[this.active_row_index];

        const new_index = Vmath.clamp(new_row_index, 0, this.editor_rows.length - 1);
        const new_editor_row = this.editor_rows[new_index];

        old_editor_row.deactivate();
        new_editor_row.activate();
        this.caret_manager.setRow(new_editor_row);
        this._active_row_index = new_index;
    }

    updateGutter() {
        let child_count = this.gutter_el.childElementCount;

        while (child_count < this.editor_rows.length) {
            const child = document.createElement("div");
            child_count++;
            child.innerText = child_count.toString();
            this.gutter_el.append(child);
        }
        while (child_count > this.editor_rows.length) {
            this.gutter_el.lastElementChild?.remove();
            child_count--;
        }
    }
    handleKeyPress(key: string) {
        const active_row = this.editor_rows[this.active_row_index];
        console.log("deleting selection", this.selection.isSelected(), this.selection);
        switch (key) {
            case Editor.KeyCodes.Backspace:
                this.deleteChar(-1);
                break;
            case Editor.KeyCodes.Delete:
                this.deleteChar(1);
                break;
            case Editor.KeyCodes.Home:
                active_row.goToStart();
                break;
            case Editor.KeyCodes.End:
                active_row.goToEnd();
                break;
            case KeyCodes.Enter:
                this.insertRowAfterCurrent();
                this.moveDown();
                break;

            case KeyCodes.ARROW_LEFT:
                this.moveCol(-1);
                break;

            case KeyCodes.ARROW_RIGHT:
                this.moveCol(1);
                break;
            case KeyCodes.ARROW_DOWN:
                this.moveDown();
                break;
            case KeyCodes.ARROW_UP:
                this.moveUp();
                break;
            case KeyCodes.Tab:
                if (this.tab_spaces_count > 0)
                    active_row.appendStr(" ".repeat(this.tab_spaces_count));
                else
                    active_row.appendStr("\t");
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

    updateIdeRect() {
        if (!this.editor_el)
            return;
        const rect       = this.editor_el.getBoundingClientRect();
        this.rect.height = rect.height;
        this.rect.width  = rect.width;
        this.rect.x      = rect.x;
        this.rect.y      = rect.y;
    }

    insertRowAfter(index: number): void {
        const old_row = this.editor_rows[index].getDomNode();
        const row_el = document.createElement("div");
        const new_row = new EditorRow(this, row_el);

        new_row.setHeight(this.row_height);
        this.editor_rows.splice(index + 1, 0, new_row);
        old_row.insertAdjacentElement("afterend", row_el);

        this.updateIdeRect();
        this.updateGutter();
    }

    insertRowAfterCurrent(): void {
        this.insertRowAfter(this.active_row_index);
    }

    moveUp(): void {
        this.active_row_index--;
    }

    moveDown(): void {
        this.active_row_index++;
    }

    getMaxColumn(row: number): number {
        if (row >= this.editor_rows.length)
            return 0;
        const editor_row = this.editor_rows[row];
        return editor_row.raw.length;
    }

    getTotalRowIndices(): number {
        return this.editor_rows.length - 1;
    }

    getColumnFromPoint(x: number): number {
        return Vmath.clamp(Math.round((x - this.rect.x) / this.char_width), 0, this.getMaxColumn(this.active_row_index));

    }

    getRowFromPoint(y: number): number {
        return Vmath.clamp(Math.round((y - this.rect.y) / this.row_height), 0, this.getTotalRowIndices());
    }

    pasteString(str: string) {
        let row_str   = "";
        let row_index = 0;
        for (const char of str) {
            if (char === "\n") {
                if (row_index >= this.editor_rows.length) {
                    this.insertRowAfter(this.editor_rows.length - 1);
                    this.moveDown();
                }

                const row = this.editor_rows[row_index];
                row.setText(row_str);
                console.log("wrote", row_str, "to", row_index);
                row_str = "";
                row_index++;
                continue;
            }
            row_str += char;
        }
        // if the string did not end with \n then we have a remaining string
        if (row_str.length > 0) {
            this.insertRowAfterCurrent();
            this.moveDown();
            const row = this.editor_rows[row_index];
            row.setText(row_str);
            row_str = "";
        }
        this.editor_rows[this.active_row_index].goToEnd();
    }

    private async initialize(): Promise<void> {
        await document.fonts.ready;

        const computed = window.getComputedStyle(this.editor_el);
        const fontStr  = `${ computed.fontSize } ${ computed.fontFamily }`;
        await document.fonts.load(fontStr);

        await new Promise(requestAnimationFrame);

        const char_box = getMonospaceCharBox(this.editor_el);
        const new_height = char_box.height;

        for (const row of this.editor_rows) {
            row.setHeight(new_height);
        }

        this.caret_manager.setFontMetrics(char_box.width, char_box.height);
        this.row_height = new_height;
        this.char_width = char_box.width;


        const row_el = document.createElement("div");
        const row    = new EditorRow(this, row_el);
        row.setHeight(this.row_height);
        this.editor_rows.push(row);
        this.editor_el.appendChild(row_el);
        this.updateIdeRect();
        this.pasteString(
            `//Test for text highlight
let x = 1000;
let y = "hello world"
print(x,y)

if(x > 100){
    print("x above hundred")
}
switch(y){
    case 1:
        while((let x:=2)){
            someFunction(x)
            x++;
        }
        break
    default:
        break
}
            `
        );

        this.updateGutter();
    }

    private deleteSelection(): void {
        if (!this.selection.isSelected())
            return;
        const start_pos = this.selection.getStart();
        const end_pos   = this.selection.getEnd();

        const start_line = start_pos.line;
        const start_col  = start_pos.col;

        const end_line = end_pos.line;
        const end_col  = end_pos.col;
        //
        if (start_line === end_line) {
            const row = this.editor_rows[start_line];
            row?.removeStr(start_col, end_col);
            this.selection.clear();
            this.caret_manager.setColumn(start_col);
            return;
        }


        const start_row = this.editor_rows[start_line];
        const end_row   = this.editor_rows[end_line];

        start_row.removeStr(start_col, -1);
        end_row.removeStr(0, end_col);

        let last_row_to_delete = end_line - 1;
        if (end_row.raw.length === 0) {
            end_row.getDomNode().remove();
            last_row_to_delete = end_line;
        }
        for (let i = start_line + 1; i <= last_row_to_delete; i++) {
            this.editor_rows[i]?.getDomNode().remove();
        }
        this.active_row_index = start_line;

        const rows_to_delete = last_row_to_delete - start_line;
        this.deleteRows(start_line + 1, rows_to_delete);

        this.selection.clear();
    }

    private deleteRow(row_index: number) {
        this.deleteRows(row_index, 1);
    }

    private deleteRows(start_row_index: number, num_rows: number): void {
        const end_index = start_row_index + num_rows - 1;
        for (let i = start_row_index; i <= end_index; i++) {
            const row = this.editor_rows[i];
            if (row) {
                row.getDomNode().remove();
            }
        }
        // correct the active row index if its gonna be deleted
        if (this.active_row_index >= start_row_index && this.active_row_index <= end_index) {
            this.active_row_index = Math.max(0, start_row_index - 1);
            this.caret_manager.setColumn(-1);
        }
        this.editor_rows.splice(start_row_index, num_rows);
        this.updateGutter();
    }

    private moveCol(delta: -1 | 1): void {
        if (this.selection.isSelected()) {
            const final_pos       = delta < 0 ? this.selection.getStart() : this.selection.getEnd();
            this.active_row_index = final_pos.line;
            this.caret_manager.setColumn(final_pos.col);
        } else {
            this.caret_manager.moveCol(delta);
        }
        this.selection.clear();
    }

    private appendChar(key: string): void {
        const active_row = this.editor_rows[this.active_row_index];
        this.deleteSelection();
        active_row.appendStr(key);
        this.caret_manager.moveCol(key.length);
    }

    private deleteChar(dir: -1 | 1): void {
        if (this.selection.isSelected()) {
            this.deleteSelection();
            return;
        }
        const active_row = this.editor_rows[this.active_row_index];
        switch (dir) {
            case -1:
                active_row.backspaceChar();
                if (this.caret_manager.isAtStart() && !this.isFirstRowActive()) {
                    const prev_row = this.editor_rows[this.active_row_index - 1];
                    this.active_row_index -= 1;
                    this.caret_manager.setColumn(-1);
                    prev_row.appendStr(active_row.raw);
                    this.deleteRow(this.active_row_index + 1);
                }
                break;
            case 1:
                if (this.caret_manager.isAtEnd() && !this.isLastRowActive()) {
                    const next_row = this.editor_rows[this.active_row_index + 1];
                    active_row.appendStr(next_row.raw);
                    this.deleteRow(this.active_row_index + 1);

                }
                active_row.deleteChar();
                break;
            default:
                alert("Invalid direction for delete char in ide");
                break;
        }

    }

    private isFirstRowActive(): boolean {
        return this._active_row_index === 0;
    }

    private isLastRowActive(): boolean {
        return this._active_row_index === this.editor_rows.length - 1;
    }
}

