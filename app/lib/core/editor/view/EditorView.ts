type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: MouseEvent) => void;
export class EditorView {
    constructor(private container: HTMLElement) {}
    render(text:string): void {}

    onKeyPress(event: KeyboardEventHandler): void {}
    onKeyUp(event: KeyboardEventHandler): void {}

    onMouseDown(event: MouseEventHandler): void {}
    onMouseUp(event: MouseEventHandler): void {}
}