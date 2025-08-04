import * as Editor from "@/editor/index";
import * as YASL from "@/yasl";

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

class YASLCaret {
    private readonly caret = document.createElement("div");
    private row = 0;
    private column = 0;
    private char_width = 10;
    private line_height = 10;
    private text_before_caret = "";

    constructor(private parent: HTMLElement) {
        this.caret.classList.add("caret");
        parent.append(this.caret);
        parent.style.position = "relative";

        window.addEventListener("resize", () => this.updateFontMetrics());
        const observer = new MutationObserver(() => {
            console.log("Font family changed to:", "something");
            this.updateFontMetrics();
        });

        observer.observe(parent, {
            attributes: true,
            attributeFilter: [ "style", "class" ]
        });

    }

    setRow(new_row: number) {
        this.row = new_row;
    }

    setColumn(new_row: number) {
        this.column = new_row;
    }

    updateCaretPosition() {
        this.caret.style.top = (this.row * this.line_height).toString() + "px";
        this.caret.style.left = (this.column * this.char_width).toString() + "px";
    }

    updateFontMetrics() {
        const new_font_metrics = getMonospaceCharBox(this.parent);
        this.char_width = new_font_metrics.width;
        this.line_height = new_font_metrics.height;

        this.caret.style.minHeight = this.line_height + "px";
    }

    moveBy(value: -1 | 1): void {
        this.column = Math.max(this.column + value, 0);

        this.updateCaretPosition();
    }
}

export class IDE {
    private readonly code_row = new Editor.CodeRow();
    private readonly text_field = document.createElement("textarea");
    private readonly editor_el = document.createElement("div");
    private readonly editor_content_el = document.createElement("div");

    private readonly caret = new YASLCaret(this.editor_el);

    constructor(parent: HTMLElement) {
        this.editor_content_el.classList.add("yasl-editor-content");
        this.editor_el.tabIndex = 0;
        this.editor_el.contentEditable = "true";
        this.editor_el.classList.add("yasl-editor");
        this.editor_el.append(this.editor_content_el);
        parent.append(this.editor_el);


        this.editor_el.onkeydown = (e) => {
            this.handleKeyPress(e.key);
            e.preventDefault();
        };
    }

    appendCharacter(char: string) {
        this.code_row.appendChar(char);
        this.render();
        this.caret.moveBy(1);
    }


    handleKeyPress(key: string) {
        switch (key) {
            case Editor.KeyCodes.Backspace:
                this.deleteCharacter();
                break;
            default:
                if (Editor.isPrintableKey(key)) {
                    this.appendCharacter(key);
                } else {
                    console.log("unknown key");
                }
                break;
        }
    }

    render() {
        const raw_text = this.code_row.raw;
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

        this.editor_content_el.innerHTML = rendered_text;
    }

    focus(): void {
        this.editor_el.focus();
    }

    private deleteCharacter(): void {
        this.code_row.deleteChar();
        this.render();
        this.caret.moveBy(-1);
    }
}
