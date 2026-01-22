type EditorIntent = { type: "command", command: string }
    | { type: "insertChar", text: string }
    | { type: "deleteLeft" }
    | { type: "deleteRight" };

function parseKey(key: string) {
    switch (key) {
        case "Enter":
        case "enter":
            return "\n";
        default:
            return key;
    }
}

export class KeybindingService {

    resolve(ctrlKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean, code: string, key: string): EditorIntent | undefined {
        const isShortcut = ctrlKey || metaKey || (ctrlKey && altKey) || (ctrlKey && shiftKey);
        if (!isShortcut) {
            switch (key) {
                case "Backspace":
                    return {type: "deleteLeft"};
                case "Delete":
                    return {type: "deleteRight"};
                default:
                    return {type: "insertChar", text: parseKey(key)};
            }
        }
        let cmd = "";
        if (metaKey)
            cmd += "meta+";
        if (ctrlKey)
            cmd += "ctrl+";
        if (altKey)
            cmd += "alt+";
        if (shiftKey)
            cmd += "shift+";
        cmd += code;
        return {type: "command", command: cmd};
    }
}