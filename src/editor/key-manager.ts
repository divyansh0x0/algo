export enum KeyCodes {
    Alt         = "Alt",
    CapsLock    = "CapsLock",
    Ctrl        = "Control",
    Backspace   = "Backspace",
    Delete      = "Delete",
    Undefined   = "Unidentified",
    Shift       = "Shift",
    Enter       = "Enter",
    Tab         = "Tab",
    Space       = " ",
    ARROW_DOWN  = "ArrowDown",
    ARROW_UP    = "ArrowUp",
    ARROW_LEFT  = "ArrowLeft",
    ARROW_RIGHT = "ArrowRight",
    Home        = "Home",
    End         = "End",
    COPY        = "C",
}

export class KeyManager {

    constructor(el: HTMLElement, private keybinding_handler: (key: KeyCodes) => any) {
        el.onkeydown = (e) => {
            this.handleKeyPress(e);
            e.preventDefault();
            e.stopImmediatePropagation();
        };

    }

    private handleKeyPress(e: KeyboardEvent) {
        const keys_pressed = [];
        if (e.ctrlKey) keys_pressed.push("ctrl");
        if (e.metaKey) keys_pressed.push("meta");
        if (e.shiftKey) keys_pressed.push("shift");
        if (e.altKey) keys_pressed.push("alt");
        keys_pressed.push(e.key);
    }
}
