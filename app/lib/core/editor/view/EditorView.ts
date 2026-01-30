import { YLexer, StringifyTokenType } from "../../yasl";
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

        this.container.tabIndex = 1;
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
        const lines = model.document.getLines();
        this.textLayer.innerHTML = "";
        const charHeight: number = this.fontservice.getCharHeight();
        for (let i = 0; i < lines.length; i++){
            const line = lines[i];
            if(line === undefined)
                continue;
            const lexer = new YLexer(line, true);
            let text = "";
            for (const token of lexer.getTokens()) {
                text += `<span class="${StringifyTokenType(token.type)}">${token.lexeme}</span>`;
            }
            let active = false;
            if (i === model.getCarets().getDefaultCaret().row)
                active = true;
            this.textLayer.innerHTML += `<div class='yl-document-row ${active ? "active" : ""}' style='height:${charHeight}px;'>` + text + "</div>";
        }
        // this.textLayer.innerText = (model.document.getText());
        this.caretEl.style.left = `${this.fontservice.getCharWidth() * model.getCarets().getDefaultCaret().col}px`;
        this.caretEl.style.top = `${charHeight * model.getCarets().getDefaultCaret().row}px`;
        this.caretEl.style.height = `${charHeight}px`;
    }

    getCode() {
        return this.presenter.getCode();
    }

    setCode(code: string) {
        this.presenter.setCode(code);
    }
}