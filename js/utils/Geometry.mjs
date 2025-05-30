export class Vector {
    static unit_x = Object.freeze(new Vector(1, 0));
    static unit_y = Object.freeze(new Vector(0, 1));
    static ZERO = Object.freeze(new Vector(0, 0));

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @returns {Vector}
     */
    copy() {
        return new Vector(this.x, this.y);
    }

    length_sqrd() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Sets the value of this vector
     * @param x
     * @param y
     * @returns {Vector}
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Returns a new vector after performing addition operation
     * @param {Vector} other
     * @returns {Vector}
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Returns a new vector after performing addition operation
     * @param {number} a
     * @param {number} b
     * @returns {Vector}
     */
    addXY(a, b) {
        return new Vector(this.x + a, this.y + b);
    }

    /**
     * Returns this vector after performing addition operation
     * @param {Vector} other
     * @returns {Vector}
     */
    add_self(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }


    /**
     * Returns a new vector after performing subtraction operation
     * @param {Vector} other
     * @returns {Vector}
     */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * Returns a new vector after performing addition operation
     * @param {number} a
     * @param {number} b
     * @returns {Vector}
     */
    subXY(a, b) {
        return new Vector(this.x - a, this.y - b);
    }

    /**
     * Returns this vector after performing subtraction operation
     * @param {Vector} other
     * @returns {Vector}
     */
    sub_self(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Returns a new vector after performing scaling operation
     * @param {number} scale scales both x and y if scale_y is undefined
     * @param {number} [scale_y]
     * @returns {Vector}
     */
    scale(scale, scale_y) {
        if (!scale_y)
            scale_y = scale;
        return new Vector(this.x * scale, this.y * scale_y);
    }

    /**
     * Scale this vector and returns this vector
     * @param {number} scale scales both x and y if scale_y is undefined
     * @param {number} [scale_y]
     * @returns {Vector}
     */
    scale_self(scale, scale_y) {
        if (!scale_y)
            scale_y = scale;
        this.x *= scale;
        this.y *= scale;
        return this;
    }

    /**
     * Takes dot product of this vector with provided vector
     * @param {Vector} other
     * @returns {number}
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    toString() {
        return this.x + "i + " + this.y + "j";
    }
}

export class Size {
    static ZERO = Object.freeze(new Size(0, 0));

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * @param {number} constant
     * @returns {Size}
     */
    scale(constant) {
        return new Size(this.width * constant, this.height * constant);
    }

    /**
     * @param {number} constant
     * @returns {Size}
     */
    scale_self(constant) {
        this.width *= constant;
        this.height *= constant;
        return this;
    }

    /**
     * @returns {number}
     */

    max() {
        return Math.max(this.width, this.height);
    }

    toString() {
        return this.width + "x" + this.height + "j";
    }

}