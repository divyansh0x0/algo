export class Size {
    static ZERO = Object.freeze(new Size(0, 0));
    public width: number;
    public height: number;

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /**
     * @param {number} constant
     * @returns {Size}
     */
    scale(constant: number): Size {
        return new Size(this.width * constant, this.height * constant);
    }

    /**
     * @param {number} constant
     * @returns {Size}
     */
    scale_self(constant: number): this {
        this.width *= constant;
        this.height *= constant;
        return this;
    }

    /**
     * @returns {number}
     */

    max(): number {
        return Math.max(this.width, this.height);
    }

    toString() {
        return this.width + "x" + this.height;
    }

    set(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    copy(): Size {
        return new Size(this.width, this.height);
    }
}
