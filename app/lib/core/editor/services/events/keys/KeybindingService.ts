
export enum CaretMovementUnit {
    CHAR,
    WORD,
}
export enum CaretMovementDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}
export type EditorIntent =
    | { type: "command", command: string }
    | { type: "insertChar", text: string }
    | { type: "deleteLeft" }
    | { type: "newline" }
    | { type: "move", direction: CaretMovementDirection, extendsSelection?: boolean, unit?: CaretMovementUnit }
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
            [ "ArrowLeft", {type: "move", direction: CaretMovementDirection.LEFT} ],
            [ "ArrowRight", {type: "move", direction: CaretMovementDirection.RIGHT} ],
            [ "ArrowUp", {type: "move", direction: CaretMovementDirection.UP} ],
            [ "ArrowDown", {type: "move", direction: CaretMovementDirection.DOWN} ],
            [ "Delete", {type: "deleteRight"} ],
            [ "Shift+ArrowLeft", {
                type: "move",
                direction: CaretMovementDirection.LEFT,
                extendsSelection: true
            } ],
            [ "Shift+ArrowRight", {
                type: "move",
                direction: CaretMovementDirection.RIGHT,
                extendsSelection: true
            } ],
            [ "Shift+ArrowUp", {
                type: "move",
                direction: CaretMovementDirection.UP,
                extendsSelection: true
            } ],
            [ "Shift+ArrowDown", {
                type: "move",
                direction: CaretMovementDirection.DOWN,
                extendsSelection: true
            } ],
            [ "Ctrl+ArrowLeft", {
                type: "move",
                direction: CaretMovementDirection.LEFT,
                unit: CaretMovementUnit.WORD,
            } ],
            [ "Ctrl+ArrowRight", {
                type: "move",
                direction: CaretMovementDirection.RIGHT,
                unit: CaretMovementUnit.WORD,
            } ],
            [ "Ctrl+Shift+ArrowLeft", {
                type: "move",
                direction: CaretMovementDirection.LEFT,
                extendsSelection: true,
                unit: CaretMovementUnit.WORD
            } ],
            [ "Ctrl+Shift+ArrowRight", {
                type: "move",
                direction: CaretMovementDirection.RIGHT,
                extendsSelection: true,
                unit: CaretMovementUnit.WORD
            } ],

        ]
    );

    resolve(cmd: string): EditorIntent | undefined {

        return this.bindings.get(cmd);
    }
}

export class KeybindingService {
    private keymap = new Keymap();


    resolve(ctrlKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean, code: string, key: string): EditorIntent | undefined {
        const isShortcut = ctrlKey || metaKey || (ctrlKey && altKey) || (ctrlKey && shiftKey) || (shiftKey && altKey);

        if (!isShortcut) {
            if (IGNORED_KEYS.has(key)) {
                return undefined;
            }
            const modifiers = [
                ctrlKey && "Ctrl",
                shiftKey && "Shift",
            ].filter(Boolean);

            const cmd = [ ...modifiers, code ].join("+");
            const binding = this.keymap.resolve(cmd);

            return binding ?? {type: "insertChar", text: cmd};
        }
        const modifiers = [
            metaKey && "Meta",
            ctrlKey && "Ctrl",
            altKey && "Alt",
            shiftKey && "Shift",
        ].filter(Boolean);

        const cmd = [ ...modifiers, code ].join("+");
        const binding = this.keymap.resolve(cmd);
        return binding ?? {type: "command", command: cmd};
    }
}