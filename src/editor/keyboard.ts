import "./yasl-keyboard.scss";

const KEYBOARD_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M4 19q-.825 0-1.412-.587T2 17V7q0-.825.588-1.412T4 5h16q.825 0 1.413.588T22 7v10q0 .825-.587 1.413T20 19zm0-2h16V7H4zm4-1h8v-2H8zm-3-3h2v-2H5zm3 0h2v-2H8zm3 0h2v-2h-2zm3 0h2v-2h-2zm3 0h2v-2h-2zM5 10h2V8H5zm3 0h2V8H8zm3 0h2V8h-2zm3 0h2V8h-2zm3 0h2V8h-2zM4 17V7z\"/></svg>";

export class YASLKeyboard {
    private static instance: YASLKeyboard | null = null;
    private readonly parent: HTMLDivElement;

    private constructor() {
        this.parent = document.createElement("div");
        this.parent.id = "yasl-keyboard";
        document.body.appendChild(this.parent);

        const icon = document.createElement("div");
        icon.classList.add("icon");
        icon.innerHTML = KEYBOARD_ICON;

        this.parent.append(icon);

    }

    public static getInstance() {
        if (!YASLKeyboard.instance)
            YASLKeyboard.instance = new YASLKeyboard();
        return YASLKeyboard.instance;
    }

    open() {
        this.parent.classList.add("open");
    }

    close() {
        this.parent.classList.remove("open");
    }
}
