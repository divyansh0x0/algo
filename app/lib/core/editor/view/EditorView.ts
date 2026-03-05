import { YLexer, StringifyTokenType } from "../../yasl";
import type { EditorPosition } from "../EditorPosition";
import type { EditorModel } from "../model/EditorModel";
import EditorPresenter from "../presenter/EditorPresenter";
import { FontService } from "../services/FontService";

type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;
export class EditorView {
    private presenter: EditorPresenter;
    // private lexer = new Lexer();
    private textLayer: HTMLElement;
    private caretEl: HTMLElement;
    private charWidth: number = 10;
    private fontservice: FontService;

    constructor(private container: HTMLElement) {
        this.presenter = new EditorPresenter(this);


        const documentWrapper = document.createElement("div");
        documentWrapper.style.position = "relative";

        this.caretEl = document.createElement("div");
        this.textLayer = document.createElement("div");

        this.container.tabIndex = 2;
        documentWrapper.append(this.textLayer, this.caretEl);
        this.container.appendChild(documentWrapper);


        this.caretEl.classList.add("yl-caret");
        this.container.classList.add("yl-editor-wrapper");
        documentWrapper.classList.add("yl-document-wrapper");

        this.fontservice = new FontService(container);
        this.fontservice.init();
    }

    onKeyDown(handler: KeyboardEventHandler): void {
        this.container.addEventListener("keydown", handler);
    }

    onKeyUp(handler: KeyboardEventHandler): void {
        this.container.addEventListener("keyup", handler);
    }

    onMouseDown(handler: MouseEventHandler): void {
        this.container.addEventListener("mousedown", handler);
    }

    onMouseUp(handler: MouseEventHandler): void {
        this.container.addEventListener("mouseup", handler);
    }

    render(model: EditorModel): void {
        const doc = model.doc;
        const lineCount = doc.getLineCount();

        this.textLayer.innerHTML = "";

        const charHeight = this.fontservice.getCharHeight();
        const charWidth = this.fontservice.getCharWidth();

        const caretOffset = model.carets[0]!;
        const caretPos = doc.getLineAndColumn(caretOffset);

        for (let i = 0; i < lineCount; i++) {
            const line = doc.getLine(i);

            const lexer = new YLexer(line, true);

            let text = "";
            for (const token of lexer.getTokens()) {
                text += `<span class="${StringifyTokenType(token.type)}">${token.lexeme}</span>`;
            }

            const active = i === caretPos.line;

            this.textLayer.innerHTML +=
                `<div class='yl-document-row ${active ? "active" : ""}' style='height:${charHeight}px;'>`
                + text +
                "</div>";
        }

        this.caretEl.style.left = `${charWidth * caretPos.column}px`;
        this.caretEl.style.top = `${charHeight * caretPos.line}px`;
        this.caretEl.style.height = `${charHeight}px`;
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
        const row = (x - boundingBox.x) / charHeight;
        const col = (y - boundingBox.y) / charWidth;
        return {
            line: row, column: col
        };
    }
}