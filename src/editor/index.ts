import "./yasl-editor.scss";

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
}

export function isPrintableKey(key: string) {
    // Exclude special keys like "Shift", "Enter", etc.
    if (key.length === 1) {
        // Checks if it's a visible character (not control chars)
        return key.match(/[\p{L}\p{N}\p{P}\p{S}\p{Z}]/u);
    }

    return false;
}

export function getLetterWidthDOM(letter: string, font = "16px monospace") {
    const span          = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre"; // preserves exact width
    span.style.font     = font;
    span.textContent    = letter;

    document.body.appendChild(span);
    const width = span.getBoundingClientRect().width;
    document.body.removeChild(span);

    return width;
}
