import { YASLNode } from "@/yasl/tree";
import "./yasl-editor.scss";

export enum KeyCodes {
    Alt = "Alt",
    CapsLock = "CapsLock",
    Ctrl = "Control",
    Backspace = "Backspace",
    Undefined = "Unidentified",
    Shift = "Shift",
    Enter = "Enter",
    Tab = "Tab",
    Space = " "
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
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre"; // preserves exact width
    span.style.font = font;
    span.textContent = letter;

    document.body.appendChild(span);
    const width = span.getBoundingClientRect().width;
    document.body.removeChild(span);

    return width;
}

export class CodeRow {
    private tokens: YASLNode[] = [];

    constructor() {}

    private _raw: string = "";

    get raw(): string {
        return this._raw;
    }

    appendChar(char: string): void {
        this._raw += char;
    }

    render() {

    }

    deleteChar(): void {
        if (this._raw.length > 0) {
            this._raw = this._raw.slice(0, this._raw.length - 1);
        }
    }

    clear(): void {
        this._raw = "";
    }
}

export class TextBackend {
    private code_rows = new Array<CodeRow>();

    constructor() {}
}

