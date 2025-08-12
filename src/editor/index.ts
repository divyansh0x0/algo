import "./yasl-editor.scss";


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
