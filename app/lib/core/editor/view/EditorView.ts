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
    private readonly selectionEl: HTMLElement;

    constructor(private container: HTMLElement) {
        const documentWrapper = document.createElement("div");
        documentWrapper.style.position = "relative";

        this.caretEl = document.createElement("div");
        this.textLayer = document.createElement("div");
        this.gutter = document.createElement("div");
        this.activeRowElement = document.createElement("div");
        this.selectionEl = document.createElement("div");

        this.textLayer.tabIndex = 1;

        documentWrapper.append(this.caretEl, this.selectionEl,this.textLayer);
        this.container.append(this.gutter, documentWrapper, this.activeRowElement);

        this.gutter.classList.add("yl-editor-number-gutter");
        this.caretEl.classList.add("yl-caret");
        this.container.classList.add("yl-editor-wrapper");
        this.activeRowElement.classList.add("yl-document-active-row-marker");
        this.textLayer.classList.add("yl-text-layer");
        this.selectionEl.classList.add("yl-selection-container");
        documentWrapper.classList.add("yl-document-wrapper");

        this.fontservice = new FontService(container);
        this.fontservice.init();

        this.presenter = new EditorPresenter(this);
        setInterval(() => {
            console.log(document.activeElement)
        },1000)
    }

    onKeyDown(handler: KeyboardEventHandler): void {
        this.textLayer.addEventListener("keydown", handler);
    }

    onKeyUp(handler: KeyboardEventHandler): void {
        this.container.addEventListener("keyup", handler);
    }

    onMouseDown(handler: MouseEventHandler): void {
        this.textLayer.addEventListener("mousedown", (e) => {
            handler(e);
            this.textLayer.focus()
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

        this.selectionEl.innerHTML = "";
        for (const selection of model.selection) {
            const selectionStart = Math.min(...selection);
            const selectionEnd = Math.max(...selection);

            const start = model.doc.getLineAndColumn(selectionStart);
            const end = model.doc.getLineAndColumn(selectionEnd);
            console.log(start, end);

            const startSelectionEl = document.createElement("div");
            startSelectionEl.classList.add("yl-editor-selection");

            startSelectionEl.style.top = `${start.line * this.fontservice.getCharHeight()}px`;
            startSelectionEl.style.left = `${start.column * this.fontservice.getCharWidth()}px`;
            startSelectionEl.style.height = `${this.fontservice.getCharHeight()}px`;
            if (start.line === end.line) {
                startSelectionEl.style.width = `${(end.column - start.column) * this.fontservice.getCharWidth()}px`;
            } else {
                startSelectionEl.style.width = `100%`;

                const endSelectionEl = document.createElement("div");
                endSelectionEl.classList.add("yl-editor-selection");
                endSelectionEl.style.top = `${end.line * this.fontservice.getCharHeight()}px`;
                endSelectionEl.style.left = `0`;
                endSelectionEl.style.width = `${end.column * this.fontservice.getCharWidth()}px`;
                endSelectionEl.style.height = `${this.fontservice.getCharHeight()}px`;

                const lineDifference = end.line - start.line - 1;
                if (lineDifference >= 1) {
                    const middleSelectionEl = document.createElement("div");
                    middleSelectionEl.classList.add("yl-editor-selection");
                    middleSelectionEl.style.top = `${(start.line + 1) * this.fontservice.getCharHeight()}px`;
                    middleSelectionEl.style.left = `0`;
                    middleSelectionEl.style.width = `100%`;
                    middleSelectionEl.style.height = `${this.fontservice.getCharHeight() * lineDifference}px`;
                    this.selectionEl.append(middleSelectionEl);
                }
                this.selectionEl.append(endSelectionEl);
            }
            this.selectionEl.append(startSelectionEl);
        }
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
        return {
            line: row, column: col
        };
    }
}