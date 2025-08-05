import { IDE } from "@/editor/ide";
import { YASLKeyboard } from "@/editor/keyboard";
import * as YASL from "@/yasl";
import "./yasl-repl.scss";

enum ReplOutputType {
    NORMAL,
    ERROR,
    WARNING,
}

const isTouchScreen = "ontouchstart" in window && navigator.maxTouchPoints > 0;

if (isTouchScreen) {
    YASLKeyboard.getInstance();
}


export class YASLRepl {
    private readonly yasl_editor: IDE;
    private readonly repl_input_container: HTMLDivElement = document.createElement("div");
    private readonly repl_output_container: HTMLDivElement = document.createElement("div");
    private readonly runtime = new YASL.Interpreter();

    constructor(parent: HTMLElement) {
        // this.input_text.classList.add("yasl-repl-input");
        this.repl_output_container.classList.add("yasl-repl-output");
        this.repl_input_container.classList.add("yasl-repl-input");

        this.yasl_editor = new IDE(this.repl_input_container);


        const repl_container = document.createElement("div");
        repl_container.classList.add("yasl-repl-container");
        repl_container.append(this.repl_input_container, this.repl_output_container);
        parent.append(repl_container);

        //
        // this.repl_input_container.onmousedown = (e) => {
        //     e.preventDefault();
        //     this.yasl_editor.focus(e.clientX,e.clientY);
        // };
    }
}
