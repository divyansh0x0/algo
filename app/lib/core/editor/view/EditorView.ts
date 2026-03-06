import { StringifyTokenType, YLexer } from "../../yasl";
import type { EditorPosition } from "../EditorPosition";
import type { EditorModel } from "../model/EditorModel";
import EditorPresenter from "../presenter/EditorPresenter";
import { FontService } from "../services/FontService";

type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;

export class EditorView {
    private presenter: EditorPresenter;
    // private lexer = new Lexer();
    private readonly textLayer: HTMLElement;
    private readonly caretEl: HTMLElement;
    private readonly gutter: HTMLElement;
    private fontservice: FontService;
    private readonly activeRowElement: HTMLElement;

    constructor(private container: HTMLElement) {
        const documentWrapper = document.createElement("div");
        documentWrapper.style.position = "relative";

        this.caretEl = document.createElement("div");
        this.textLayer = document.createElement("div");
        this.gutter = document.createElement("div");
        this.activeRowElement = document.createElement("div");
        this.container.tabIndex = 0;

        documentWrapper.append(this.textLayer, this.caretEl);
        this.container.append(this.gutter, documentWrapper, this.activeRowElement);

        this.gutter.classList.add("yl-editor-number-gutter");
        this.caretEl.classList.add("yl-caret");
        this.container.classList.add("yl-editor-wrapper");
        this.activeRowElement.classList.add("yl-document-active-row-marker");
        this.textLayer.classList.add("yl-text-layer");
        documentWrapper.classList.add("yl-document-wrapper");

        this.fontservice = new FontService(container);
        this.fontservice.init();

        this.presenter = new EditorPresenter(this);
        this.container.addEventListener("mousedown", () => {
            this.container.focus();
        });
    }

    onKeyDown(handler: KeyboardEventHandler): void {
        this.container.addEventListener("keydown", handler);
    }

    onKeyUp(handler: KeyboardEventHandler): void {
        this.container.addEventListener("keyup", handler);
    }

    onMouseDown(handler: MouseEventHandler): void {
        this.container.addEventListener("mousedown", (e) => {
            handler(e);
        });
    }

    onMouseUp(handler: MouseEventHandler): void {
        this.container.addEventListener("mouseup", handler);
    }

    render(model: EditorModel): void {
        const doc = model.doc;
        const lineCount = doc.getLineCount();

        const charHeight = this.fontservice.getCharHeight();
        const charWidth = this.fontservice.getCharWidth();

        const caretOffset = model.carets[0]!;
        const caretPos = doc.getLineAndColumn(caretOffset);

        let html = "";
        for (let i = 0; i < lineCount; i++) {
            const line = doc.getLine(i);

            const lexer = new YLexer(line, true);

            let text = "";
            for (const token of lexer.getTokens()) {
                text += `<span class="${StringifyTokenType(token.type)}">${token.lexeme}</span>`;
            }

            const active = i === caretPos.line;

            html +=
                `<div class='yl-document-row ${active ? "active" : ""}' style='height:${charHeight}px;'>`
                + text +
                "</div>";
        }
        this.textLayer.innerHTML = html;

        if (this.gutter.children.length !== model.doc.getLineCount()) {
            let html = "";
            for (let i = 1; i <= model.doc.getLineCount(); i++) {
                html += `<span>${i}</span>`;
            }
            this.gutter.innerHTML = html;
        }
        this.caretEl.style.left = `${charWidth * caretPos.column}px`;
        this.caretEl.style.top = `${charHeight * caretPos.line}px`;
        this.caretEl.style.height = `${charHeight}px`;
        this.activeRowElement.style.top = `${charHeight * caretPos.line}px`;
        this.activeRowElement.style.height = `${charHeight}px`;
    }

    getCode() {
        return this.presenter.getCode();
    }

    setCode(code: string) {
        this.presenter.setCode(code);
    }

    // Returns the window x,y coordinates in editor caret positions
    getEditorPosition(x: number, y: number): EditorPosition {
        const charHeight: number = this.fontservice.getCharHeight();
        const charWidth: number = this.fontservice.getCharWidth();
        const boundingBox = this.textLayer.getBoundingClientRect();
        const row = Math.round((y - boundingBox.top) / charHeight);
        const col = Math.round((x - boundingBox.left) / charWidth);
        console.log("row", row, col);
        return {
            line: row, column: col
        };
    }
}