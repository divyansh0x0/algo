export type EditorIntent =
    | { type: "command", command: string }
    | { type: "insertChar", text: string }
    | { type: "deleteLeft" }
    | { type: "newline" }
    | { type: "moveRight" }
    | { type: "moveUp" }
    | { type: "moveDown" }
    | { type: "moveLeft" }
    | { type: "deleteRight" };

type CommandID = string;
const IGNORED_KEYS = new Set([
    "Shift",
    "Meta",
    "Alt",
    "CapsLock"
]);
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

            if (IGNORED_KEYS.has(key)) {
                return undefined;
            }

            const binding = this.keymap.resolve(key);

            return binding ?? { type: "insertChar", text: key };
        }
        const modifiers = [
            metaKey && "meta",
            ctrlKey && "ctrl",
            altKey && "alt",
            shiftKey && "shift",
        ].filter(Boolean);

        console.log(binding,modifiers);
        const cmd = [...modifiers, code].join("+");
        return {type: "command", command: cmd};
    }
}