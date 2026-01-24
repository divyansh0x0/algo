type EditorIntent = { type: "command", command: string }
    | { type: "insertChar", text: string }
    | { type: "deleteLeft" }
    | { type: "newline" }
    | { type: "moveRight" }
    | { type: "moveUp" }
    | { type: "moveDown" }
    | { type: "moveLeft" }
    | { type: "deleteRight" };

type CommandID = string;

export class Keymap {
    private bindings = new Map<CommandID, EditorIntent>(
        [
            [ "Enter", {type: "newline"} ],
            [ "Backspace", {type: "deleteLeft"} ],
            [ "ArrowLeft", {type: "moveLeft"} ],
            [ "ArrowRight", {type: "moveRight"} ],
            [ "ArrowUp", {type: "moveUp"} ],
            [ "ArrowDown", {type: "moveDown"} ],
            [ "Delete", {type: "deleteRight"} ],
        ]
    );

    resolve(cmd: string): EditorIntent | undefined {

        return this.bindings.get(cmd);
    }
}

export class KeybindingService {
    private keymap = new Keymap();
    resolve(ctrlKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean, code: string, key: string): EditorIntent | undefined {
        const isShortcut = ctrlKey || metaKey || (ctrlKey && altKey) || (ctrlKey && shiftKey);
        if (!isShortcut) {
            const keymapBinding = this.keymap.resolve(key);
            if(keymapBinding === undefined) return {type: "insertChar", text: key};
            return keymapBinding;
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