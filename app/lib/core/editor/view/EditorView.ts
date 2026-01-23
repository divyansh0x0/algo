import type { EditorModel } from "../model/EditorModel";
import EditorPresenter from "../presenter/EditorPresenter";
import { FontService } from "../services/FontService";

type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;
export class EditorView {
    private presenter: EditorPresenter;

    private textLayer:HTMLElement;
    private caretEl:HTMLElement;
    private charWidth: number = 10;
    private fontservice:FontService;
    constructor(private container: HTMLElement) {
        this.presenter = new EditorPresenter(this);


        const documentWrapper = document.createElement("div");
        documentWrapper.style.position = "relative";

        this.caretEl = document.createElement("div");
        this.textLayer = document.createElement("div");

        this.container.tabIndex = 1;
        documentWrapper.append(this.textLayer,this.caretEl);
        this.container.appendChild(documentWrapper);


        this.caretEl.classList.add("yl-caret");
        this.container.classList.add("yl-editor-wrapper");
        documentWrapper.classList.add("yl-document-wrapper");

        this.fontservice = new FontService(container);
        this.fontservice.init();
    }

    onKeyDown(handler: KeyboardEventHandler): void {
        this.container.addEventListener('keydown', handler);
    }

    onKeyUp(handler: KeyboardEventHandler): void {
        this.container.addEventListener('keyup', handler);
    }

    onMouseDown(handler: MouseEventHandler): void {
        this.container.addEventListener('mousedown', handler);
    }

    onMouseUp(handler: MouseEventHandler): void {
        this.container.addEventListener('mouseup', handler);
    }

    render(model: EditorModel): void {
        this.textLayer.innerText = (model.document.getText());
        this.caretEl.style.left = `${this.fontservice.getCharWidth() * model.getCarets().getDefaultCaret().col}px`;
        this.caretEl.style.top = `${this.fontservice.getCharHeight()* model.getCarets().getDefaultCaret().row}px`;

    }
}