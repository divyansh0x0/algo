/**
 * Represents a directional selection between two document offsets.
 *
 * `anchor` — the fixed end (where the selection started).
 * `active` — the moving end (where the caret currently is).
 *
 * The selection may be reversed (active < anchor).
 */
export class EditorSelection {
    constructor(
        public anchor: number,
        public head: number,
    ) {}

    /** The lower of the two offsets, regardless of direction. */
    min(): number {
        return this.anchor < this.head ? this.anchor : this.head;
    }

    /** The higher of the two offsets, regardless of direction. */
    max(): number {
        return this.anchor < this.head ? this.head : this.anchor;
    }

    /** True when the active end is before the anchor (right-to-left selection). */
    isReversed(): boolean {
        return this.head < this.anchor;
    }

    /** Shift both endpoints by `delta`. */
    shift(delta: number): void {
        this.anchor += delta;
        this.head += delta;
    }
}
