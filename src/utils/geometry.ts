export class Vector {
    public static unit_x = Object.freeze(new Vector(1, 0));
    public static unit_y = Object.freeze(new Vector(0, 1));
    public static ZERO = Object.freeze(new Vector(0, 0));
    x: number;
    y: number;


    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }


    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    length_sqrd(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Sets the value of this vector
     */
    set(x: number, y: number): Vector {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Returns a new vector after performing addition operation
     */
    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Returns a new vector after performing addition operation
     */
    addXY(x: number, y: number): Vector {
        return new Vector(this.x + x, this.y + y);
    }

    /**
     * Returns this vector after performing addition operation
     */
    add_self(other: Vector): this {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Returns a new vector after performing subtraction operation
     */
    subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * Returns a new vector after performing addition operation
     */
    subXY(x: number, y: number): Vector {
        return new Vector(this.x - x, this.y - y);
    }

    /**
     * Returns this vector after performing subtraction operation
     */
    sub_self(other: Vector): this {
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
    scale(scale: number, scale_y?: number) {
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
    scale_self(scale: number, scale_y?: number): this {
        if (!scale_y)
            scale_y = scale;
        this.x *= scale;
        this.y *= scale;
        return this;
    }

    /**
     * Takes dot product of this vector with provided vector

     */
    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    toString() {
        return this.x + "i + " + this.y + "j";
    }
}

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
        return this.width + "x" + this.height + "j";
    }

}
