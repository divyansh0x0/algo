import type { EditorModel } from "../model/EditorModel";
import { EditorPresenter } from "../presenter/EditorPresenter";
import { CursorView } from "./CursorView";

type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;
export class EditorView {
    private presenter: EditorPresenter;
    private cursorView: CursorView;
    constructor(private container: HTMLElement) {
        this.presenter = new EditorPresenter(this);
        this.container.tabIndex = 1;


        this.cursorView = new CursorView(container);
    }
    onKeyDown(handler: KeyboardEventHandler): void {
        this.container.addEventListener('keypress', handler);
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
        console.log(model);
        this.container.innerText = (model.document.getText());
        this.cursorView.render(model);
    }
}