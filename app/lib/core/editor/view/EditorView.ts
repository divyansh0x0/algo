import type { EditorModel } from "../model/EditorModel";
import EditorPresenter from "../presenter/EditorPresenter";

type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;
export class EditorView {
    private presenter: EditorPresenter;

    private textLayer:HTMLElement;
    private caretEl:HTMLElement;
    private charWidth: number = 10;
    constructor(private container: HTMLElement) {
        this.presenter = new EditorPresenter(this);


        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";

        this.caretEl = document.createElement("div");
        this.caretEl.style.position = 'absolute';
        this.caretEl.style.top = '0';
        this.caretEl.style.left = '0';
        this.caretEl.style.width = '2px';
        this.caretEl.style.height = '1.2em';
        this.caretEl.style.backgroundColor = '#fff';

        this.textLayer = document.createElement("div");

        this.container.tabIndex = 1;
        wrapper.append(this.textLayer,this.caretEl);
        this.container.appendChild(wrapper);


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
        this.caretEl.style.left = `${this.charWidth * model.getCarets().getDefaultCaret().col}px`;
        this.caretEl.style.top = `${this.charWidth * model.getCarets().getDefaultCaret().row}px`;

    }
}