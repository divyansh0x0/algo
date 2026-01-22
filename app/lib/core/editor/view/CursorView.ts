import type { EditorModel } from "../model/EditorModel";

export class CursorView {
    private cursorEl;
    private charWidth: number = 10;
    constructor(private parent: HTMLElement) {


        this.cursorEl = new HTMLDivElement();
        this.parent.appendChild(this.cursorEl);
        this.cursorEl.style.position = 'absolute';
        this.cursorEl.style.top = '0';
        this.cursorEl.style.left = '0';
        this.cursorEl.style.width = '2px';
        this.cursorEl.style.height = '1.2em';
        this.cursorEl.style.backgroundColor = '#fff';
    }

    render(model: EditorModel): void {
        console.log(model);
        this.cursorEl.style.left = `${this.charWidth * model.getCaret().getColumn()}px`;
        this.cursorEl.style.top = `${this.charWidth * model.getCaret().getRow()}px`;
    }
}