import * as Editor                  from "@/editor";
import { CaretManager }             from "@/editor/caret";
import { KeyCodes, KeyManager }     from "@/editor/key-manager";
import { IDESelection }             from "@/editor/selection";
import { StringUtils }              from "@/utils/stringutils";
import { Vmath }                    from "@/utils/vmath";
import * as YASL                    from "@/yasl";
import { Lexer, Parser, YASLToken } from "@/yasl";
import "./yasl-editor.scss";

const TEST_CODE = `//Test for text highlight
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
`;

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


function isInBounds(x: number, y: number, rect: DOMRect): any {
    return x > rect.x
        && x < rect.x + rect.width
        && y > rect.y
        && y < rect.y + rect.height;
}

export class IDERow {
    private insertion_col = 0;
    private _raw: string  = "";

    constructor(private ide: IDE, private row_el: HTMLElement) {
        this.row_el.classList.add("yasl-editor-row");
    }

    private _tokens: YASL.YASLToken[] = [];

    get tokens(): YASLToken[] {return this._tokens;}

    get raw(): string {
        return this._raw;
    }


    private set tokens(value: YASLToken[]) {this._tokens = value;}

    private set raw(str: string) {
        this._raw   = str;
        const lexer = new Lexer(this._raw + "\n", true);
        this.tokens = lexer.getTokens();
    };

    render() {
        const raw_text    = this.raw;
        let rendered_text = "";
        if (this.tokens.length > 0) {
            for (const token of this.tokens) {
                if (token.type === YASL.TokenType.EOF)
                    break;
                const text = raw_text.slice(token.start, token.end);
                rendered_text += `<span class='${ YASL.StringifyTokenType(token.type) }'>${ text }</span>`;
            }
        } else {
            rendered_text = raw_text;
        }
        let x        = 1000;
        this.row_el.innerHTML = rendered_text;
        this._tokens = this.tokens;

        // calculating indents
        const leading_whitespace_count = StringUtils.countLeadingWhitespaces(this.raw);
        if (leading_whitespace_count === this.raw.length)
            return;
        const total_indent = leading_whitespace_count / this.ide.tab_width;
        const indent_width = this.ide.caret_manager.char_width * this.ide.tab_width;

        let gradient_str = "";

        const indent_decoration_width = 2;
        console.log(this.raw, total_indent);
        for (let i = 1; i < total_indent; i++) {
            const start_x = i * indent_width;
            const mid_x   = start_x + indent_decoration_width;
            const end_x   = mid_x;
            gradient_str += `, transparent ${ start_x }px ,var(--yasl-ide-indent-color) ${ mid_x }px, transparent ${ end_x }px`;
        }
        this.row_el.style.background = `linear-gradient(90deg ${ gradient_str } )`;
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
            this.raw += str;
        } else if (this.insertion_col < this.raw.length) {
            this.raw = this.raw.slice(0, this.insertion_col) + str + this.raw.slice(this.insertion_col);
        }
        this.render();
    }

    clear(): void {
        this.raw = "";
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
            this.raw = this.raw.slice(this.insertion_col, this.raw.length);
            this.ide.caret_manager.setColumn(0);
        } else {
            this.raw = this.raw.slice(0, this.insertion_col - 1) + this.raw.slice(this.insertion_col, this.raw.length);
            this.ide.caret_manager.moveCol(-1);
        }

        console.log("backspace", this.raw);
        this.render();

    }

    removeStr(start: number, end: number = -1) {
        if (start === 0 && (end === this.raw.length || end === -1)) {
            this.raw = "";
        }
        if (start >= 0 && end >= 0 && start !== end) {
            const left  = this.raw.slice(0, start);
            const right = this.raw.slice(end, this.raw.length);
            this.raw = left + right;
        } else if (start > 0 && end < 0) {
            const corrected_end = this.raw.length + end + 1;
            const left          = this.raw.slice(0, start);
            const right         = this.raw.slice(corrected_end, this.raw.length);
            this.raw = left + right;
        }
        this.render();
    }

    deleteChar(): void {
        if (this._raw.length > 0 && this.insertion_col < this.raw.length) {
            this.raw = this.raw.slice(0, this.insertion_col) + this.raw.slice(this.insertion_col + 1, this.raw.length);
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
    }

    setText(row_str: string): void {
        this.raw = row_str;
        this.render();
    }
}

export class IDE {
    public readonly row_wrapper_rect = new DOMRect();
    private readonly editor_rows: IDERow[] = [];
    public readonly caret_manager: CaretManager;
    public tab_width: number          = 4;
    private readonly gutter_el       = document.createElement("div");
    private readonly editor_el       = document.createElement("div");
    public readonly selection: IDESelection  = new IDESelection(this.editor_el, this);
    private readonly row_wrapper     = document.createElement("div");
    private readonly key_manager: KeyManager = new KeyManager(this.editor_el, this.bindKeyboardEvents);
    private is_mouse_down: boolean    = false;
    private row_height: number        = 10;
    private char_width: number        = 10;
    private _active_row_index: number = 0;

    constructor(parent: HTMLElement) {
        this.createDomStructure(parent);
        this.bindMouseEvents();
        this.bindResizeEvents();
        this.bindBlurEvent();
        this.initialize().then(() => {
            this.editor_el.classList.add("ready");
        });
        this.caret_manager = new CaretManager(this.editor_el, this.editor_rows[this.active_row_index]);
    }

    private createDomStructure(parent: HTMLElement) {
        const editor_wrapper = document.createElement("div");
        editor_wrapper.append(this.gutter_el, this.editor_el);
        editor_wrapper.classList.add("yasl-editor-wrapper");

        this.editor_el.tabIndex = 1;
        this.editor_el.classList.add("yasl-editor");
        this.gutter_el.classList.add("yasl-editor-gutter");
        this.row_wrapper.classList.add("yasl-editor-rows-wrapper");
        const loader = document.createElement("div");
        loader.classList.add("yasl-ide-loader");
        loader.innerText = "loading";
        this.editor_el.append(loader, this.row_wrapper);


        parent.append(editor_wrapper);
    }

    private bindMouseEvents() {
        this.editor_el.onmousedown = (e) => {
            this.updateIdeRect();
            switch (e.detail) {
                case 1: {
                    const row = this.getRowFromPoint(e.clientY);
                    const col = this.getColumnFromPoint(e.clientX);

                    this.active_row_index = row;

                    this.caret_manager.setColumn(col);
                    this.selection.setAnchor(col, row);
                    this.is_mouse_down = true;
                    break;
                }
                case 2:
                    this.editor_rows[this.active_row_index]?.selectWord(e.clientX, e.clientY);
                    break;
                default: {
                    const col = this.getColumnFromPoint(e.clientX);
                    this.caret_manager.setColumn(col);
                    this.selection.selectRow(this.active_row_index);
                    break;
                }

            }


            this.editor_el.focus();
            e.preventDefault();
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
    }

    private bindResizeEvents() {
        window.addEventListener("resize", () => this.updateIdeRect());

        const resize_observer = new ResizeObserver(() => {
            this.updateIdeRect();
        });
        resize_observer.observe(this.row_wrapper);
    }

    private bindBlurEvent() {
        this.editor_el.onblur = () => {
            this.editor_rows[this.active_row_index]?.deactivate();
        };
    }

    private async initialize(): Promise<void> {
        await document.fonts.ready;

        const computed = window.getComputedStyle(this.editor_el);
        const fontStr  = `${ computed.fontSize } ${ computed.fontFamily }`;
        await document.fonts.load(fontStr);

        await new Promise(requestAnimationFrame);

        const char_box   = getMonospaceCharBox(this.editor_el);
        const new_height = char_box.height;

        for (const row of this.editor_rows) {
            row.setHeight(new_height);
        }

        this.caret_manager.setFontMetrics(char_box.width, char_box.height);
        this.row_height = new_height;
        this.char_width = char_box.width;


        const row_el = document.createElement("div");
        const row    = new IDERow(this, row_el);
        row.setHeight(this.row_height);
        this.editor_rows.push(row);
        this.row_wrapper.appendChild(row_el);
        this.updateIdeRect();
        this.pasteString(TEST_CODE);

        this.updateGutter();
        this.editor_rows[this.active_row_index]?.deactivate();
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


    updateIdeRect() {
        if (!this.editor_el)
            return;
        const rect: DOMRect          = this.row_wrapper.getBoundingClientRect();
        this.row_wrapper_rect.height = rect.height;
        this.row_wrapper_rect.width  = rect.width;
        this.row_wrapper_rect.x      = rect.x;
        this.row_wrapper_rect.y      = rect.y;

    }

    insertRowAfter(index: number): void {
        const old_row = this.editor_rows[index].getDomNode();
        const row_el  = document.createElement("div");
        const new_row = new IDERow(this, row_el);

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
        return Vmath.clamp(Math.round((x - this.row_wrapper_rect.x) / this.char_width), 0, this.getMaxColumn(this.active_row_index));

    }

    getRowFromPoint(y: number): number {
        return Vmath.clamp(Math.round((y - this.row_wrapper_rect.y) / this.row_height), 0, this.getTotalRowIndices());
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

    run() {
        let text = "";
        for (let i = 0; i < this.editor_rows.length; i++) {
            const row = this.editor_rows[i];
            text += row.raw + "\n";
        }

        const lexer  = new Lexer(text);
        const parser = new Parser(lexer.getTokens(), lexer.getLineMap());

        console.log(text);
        console.log(parser.getProgram());

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


    private bindKeyboardEvents(key: KeyCodes) {
        const active_row = this.editor_rows[this.active_row_index];
        switch (key) {
            case KeyCodes.Backspace:
                this.deleteChar(-1);
                break;
            case KeyCodes.Delete:
                this.deleteChar(1);
                break;
            case KeyCodes.Home:
                active_row.goToStart();
                break;
            case KeyCodes.End:
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
                if (this.tab_width > 0)
                    active_row.appendStr(" ".repeat(this.tab_width));
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


    private isLastRowActive(): boolean {
        return this._active_row_index === this.editor_rows.length - 1;
    }
}

// handleKeyPress(key: string, ctrl_key_pressed:boolean, shift_key_pressed:boolean) {
//     console.log("deleting selection", this.selection.isSelected(), this.selection);
//     this.caret_manager.posChanged();
//
//     if(ctrl_key_pressed){
//
//         switch (key.toLowerCase()){
//             case Editor.KeyCodes.COPY:
//                 this.copyToClipboard();
//         }
//     }
//
//
// }
