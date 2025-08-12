import { IDE } from "@/editor/ide";

interface IDEPosition {
    line: number,
    col: number,
}

export class IDESelection {
    private readonly anchor: IDEPosition = {
        line: 0,
        col : 0
    };
    private readonly head: IDEPosition   = {
        line: 0,
        col : 0
    };


    private anchor_el                   = document.createElement("div");
    private middle_el                   = document.createElement("div");
    private head_el                     = document.createElement("div");
    private single_selected_row: number = -1;

    constructor(parent: HTMLElement, private ide: IDE) {
        parent.append(this.anchor_el, this.middle_el, this.head_el);

        this.anchor_el.classList.add("yasl-ide-selection-el");
        this.middle_el.classList.add("yasl-ide-selection-el");
        this.head_el.classList.add("yasl-ide-selection-el");
    }

    moveHead(col: number, row: number): void {
        this.head.line = row;
        this.head.col  = col;

        this.render();
    }

    setAnchor(col: number, row: number): void {
        this.clear();
        const max_col    = this.ide.getMaxColumn(row);
        this.anchor.col  = Math.min(col, max_col);
        this.anchor.line = row;
    }

    clear(): void {
        this.head.col  = 0;
        this.head.line = 0;

        this.anchor.col  = 0;
        this.anchor.line = 0;

        this.single_selected_row = -1;

        this.anchor_el.style = "";
        this.middle_el.style = "";
        this.head_el.style   = "";
    }

    isSelected(): boolean {
        const style_value = this.anchor_el.getAttribute("style");
        if (typeof style_value === "string") {
            return style_value.length > 0;
        } else {
            return false;
        }
    }

    getStart() {
        if (this.anchor.line === this.head.line) {
            return this.anchor.col < this.head.col ? this.anchor : this.head;
        } else {
            return this.anchor.line < this.head.line ? this.anchor : this.head;
        }
    }

    getEnd() {
        if (this.anchor.line === this.head.line) {
            return this.anchor.col < this.head.col ? this.head : this.anchor;
        } else {
            return this.anchor.line < this.head.line ? this.head : this.anchor;
        }
    }

    selectRow(row_index: number): void {
        this.clear();
        this.single_selected_row = row_index;
        this.render();
    }

    updateBounds() {
    }

    private render() {
        if (this.single_selected_row >= 0) {
            const line_height           = this.ide.caret_manager.line_height;
            this.anchor_el.style.left   = "0";
            this.anchor_el.style.top    = this.single_selected_row * line_height + "px";
            this.anchor_el.style.width  = this.ide.row_wrapper_rect.width + "px";
            this.anchor_el.style.height = line_height + "px";
            return;
        }
        if (this.head.col === this.anchor.col && this.head.line === this.anchor.line) {
            this.anchor_el.style = "";
            this.middle_el.style = "";
            this.head_el.style   = "";
            return;
        }
        const char_width  = this.ide.caret_manager.char_width;
        const line_height = this.ide.caret_manager.line_height;
        const line_width  = this.ide.row_wrapper_rect.width;


        this.anchor_el.style.height = line_height + "px";
        this.anchor_el.style.top    = this.anchor.line * line_height + "px";

        if (this.head.line === this.anchor.line) {
            let min_col: number;
            let max_col: number;
            if (this.head.col > this.anchor.col) {
                min_col = this.anchor.col;
                max_col = this.head.col;
            } else {
                min_col = this.head.col;
                max_col = this.anchor.col;
            }
            const col_diff = max_col - min_col;

            this.anchor_el.style.left  = min_col * char_width + "px";
            this.anchor_el.style.width = col_diff * char_width + "px";

            this.middle_el.style = "";
            this.head_el.style   = "";

            this.ide.active_row_index = this.head.line;
            this.ide.caret_manager.setColumn(this.head.col);

            return;
        }

        // top and head lines of selection
        let min_line: number;
        //up to down selection
        if (this.anchor.line < this.head.line) {
            this.anchor_el.style.width = (line_width - this.anchor.col * char_width) + "px";
            this.anchor_el.style.left  = this.anchor.col * char_width + "px";
            this.head_el.style.left    = "0";
            this.head_el.style.width   = this.head.col * char_width + "px";
            min_line                   = this.anchor.line;
        } else {
            //down to up selection
            this.anchor_el.style.width = this.anchor.col * char_width + "px";
            this.anchor_el.style.left  = "0";
            this.head_el.style.left    = this.head.col * char_width + "px";
            this.head_el.style.width   = (line_width - this.head.col * char_width) + "px";
            min_line                   = this.head.line;
        }


        // middle lines of selection
        const line_gap = Math.abs(this.head.line - this.anchor.line) - 1;
        if (line_gap !== 0) {
            this.middle_el.style.left   = "0";
            this.middle_el.style.top    = (min_line + 1) * line_height + "px";
            this.middle_el.style.width  = line_width + "px";
            this.middle_el.style.height = line_gap * line_height + "px";
        } else {
            this.middle_el.style = "";
        }


        this.head_el.style.top    = this.head.line * line_height + "px";
        this.head_el.style.height = line_height + "px";

    }
}
