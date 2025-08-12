export enum KeyCodes {
    Alt         = "alt",
    CapsLock    = "capsLock",
    Ctrl        = "control",
    Backspace   = "backspace",
    Delete      = "delete",
    Undefined   = "inidentified",
    Shift       = "shift",
    Enter       = "enter",
    Tab         = "tab",
    Space       = " ",
    ARROW_DOWN  = "arrowdown",
    ARROW_UP    = "arrowup",
    ARROW_LEFT  = "arrowleft",
    ARROW_RIGHT = "arrowright",
    Home        = "home",
    End         = "end",
    COPY        = "ctrl+c",
}

export class KeyManager {
    private is_shortcut_key             = false;
    private prev_keys_pressed: string[] = [];

    constructor(el: HTMLElement, private keybinding_handler: (key: string) => any) {
        el.onkeydown = (e) => {
            this.handleKeyPress(e);
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        window.addEventListener("keyup", () => {

        });
    }

    private handleKeyPress(e: KeyboardEvent) {
        let is_shortcut_key = false;
        const keys_pressed = [];
        if (e.ctrlKey) keys_pressed.push("ctrl");
        if (e.metaKey) keys_pressed.push("meta");
        if (e.altKey) keys_pressed.push("alt");
        if (e.shiftKey) keys_pressed.push("shift");

        if (e.key && (keys_pressed.length > 1 || (keys_pressed.length === 1 && keys_pressed[0] !== "shift"))) {
            is_shortcut_key = true;
            keys_pressed.push(e.key.toLowerCase());
        }

        if (is_shortcut_key) {
            const new_key_binding = keys_pressed.join("+");
            const old_key_binding = this.prev_keys_pressed.join("+");
            if (old_key_binding !== new_key_binding) {
                this.keybinding_handler(new_key_binding);
                this.prev_keys_pressed = keys_pressed;
            }
        } else {
            this.keybinding_handler(e.key);
        }


    }
}
